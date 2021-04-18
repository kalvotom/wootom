import {parse as parseYAML} from 'yaml';
import {Stack} from '../../util/containers/stack';
import {horizontalWhitespace} from '../../util/regex-patterns/charsets';
import {eol} from '../../util/regex-patterns/sequences';
import {
    getEndingNewline,
    trimEndingNewline,
    trimIndentation,
} from '../../util/text/multiline';
import {WooElementKind} from '../../util/types/woo';
import {ASTNode} from '../ast/ast-node';
import {ASTNodePosition} from '../ast/ast-node-position';
import {DocumentObject} from '../ast/document-object';
import {DocumentPart} from '../ast/document-part';
import {DocumentRoot} from '../ast/document-root';
import {IndentedBlock} from '../ast/indented-block';
import {OuterEnv} from '../ast/outer-env';
import {TextBlock} from '../ast/text-block';
import {TextNode} from '../ast/text-node';
import {Matcher} from './matchers/matcher';
import {SimpleMatcher} from './matchers/simple-matcher';
import * as regex from './regex-patterns/woo';

type ParseResult<T extends ASTNode> = {
    /** The parsed content */
    parsed: T;
    /** Non-parsed source remainder */
    after: string;
};

const metablockMatcher = new SimpleMatcher(
    new RegExp(`^${regex.yamlMetablock}`, 'm'),
);
const documentPartMatcher = new SimpleMatcher(new RegExp(regex.documentPart));
const documentObjectMatcher = new SimpleMatcher(
    new RegExp(regex.documentObject),
);
const outerEnvMatcher = new SimpleMatcher(new RegExp(regex.outerEnv));
const fragileOuterEnvMatcher = new SimpleMatcher(
    new RegExp(regex.fragileOuterEnv),
);
const textBlockSeparatorMatcher = new SimpleMatcher(
    new RegExp(`${eol}${horizontalWhitespace}*${eol}`),
);

/** Parses a WooWoo document into a WooWoo AST */
export class Parser {
    /**
     * Parse a WooWoo document into a WooWoo AST
     *
     * @param source The source WooWoo document to be parsed
     * @returns The root node of the parsed AST
     */
    parse(source: string): ASTNode {
        const start = new ASTNodePosition(1, 1, 0);
        const root = new DocumentRoot(ASTNodePosition.getEnd(start, source));
        this.parseBlockContent(start, root, source);
        return root;
    }

    /**
     * Parse block content
     *
     * @param start The position of the start of the block content
     * @param parent The parent node of the block content
     * @param source The source of the block content to be parsed
     * @returns An array of nodes parsed from the source (empty if nothing
     * could be parsed)
     */
    private parseBlockContent(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): void {
        const scope = new Stack<ASTNode>();
        let remainingSource = source;
        let prevRemainderLength;
        while (remainingSource.length > 0) {
            if (remainingSource.length === prevRemainderLength)
                throw new Error('Unknown error in parsing');
            prevRemainderLength = remainingSource.length;

            const trimmedRemainder = remainingSource.trimLeft();
            if (trimmedRemainder !== remainingSource) {
                const whitespaceTrimmed = remainingSource.slice(
                    0,
                    -trimmedRemainder.length,
                );
                remainingSource = trimmedRemainder;
                start = ASTNodePosition.getEnd(start, whitespaceTrimmed);
                continue;
            }

            scope.popWhile(node => start.column <= node.startColumn);
            const realParent = scope.top ?? parent;

            const unscoped: WooElementKind[] = [
                'DocumentPart',
                'IndentedBlock',
                'TextBlock',
            ];
            const parsingSteps = [
                this.parseFragileOuterEnvContent.bind(this),
                this.parseDocumentPart.bind(this),
                this.parseDocumentObject.bind(this),
                this.parseFragileOuterEnv.bind(this),
                this.parseOuterEnv.bind(this),
                this.parseIndentedBlock.bind(this),
                this.parseTextBlock.bind(this),
            ];
            for (const parsingStep of parsingSteps) {
                const parsingResult = parsingStep(
                    start,
                    realParent,
                    remainingSource,
                );
                if (typeof parsingResult !== 'undefined') {
                    const {parsed, after} = parsingResult;
                    if (!unscoped.includes(parsed.kind)) scope.push(parsed);
                    realParent.addChildren(parsed);
                    remainingSource = after;
                    start = parsed.end;
                    break;
                }
            }
        }
    }

    /**
     * Parse inline content
     *
     * @param start The position of the start of the inline content
     * @param parent The parent node of the inline content
     * @param source The source of the inline content to be parsed
     * @returns An array of nodes parsed from the source (empty if nothing
     * could be parsed)
     */
    private parseInlineContent(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ASTNode[] {
        return [this.parseTextNode(start, parent, source)];
    }

    /**
     * Parse a YAML metablock
     *
     * @param source The source of the metablock to be parsed, or `undefined` if
     * there is no metablock source to parse
     * @returns The parsed metablock, or an empty object if the metablock source
     * isn't a valid metablock
     */
    private parseMetablock(source?: string): Record<string, unknown> {
        if (typeof source === 'undefined') return {};
        const res = parseYAML(source) ?? {};
        if (typeof res !== 'object' || Array.isArray(res)) {
            return {};
        }
        return res;
    }

    /**
     * Parse a document part
     *
     * @param start The position of the start of the document part
     * @param parent The parent node of the document part
     * @param source The source of the document part to be parsed
     * @returns A new document part along with the non-parsed source remainder;
     * or `undefined` if no document part could be parsed
     */
    private parseDocumentPart(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ParseResult<DocumentPart> | undefined {
        const match = documentPartMatcher.findFirstMatch(source);
        if (typeof match === 'undefined' || match.index !== 0) {
            return;
        }
        const [beforeTitle, variant, title, metablock] = match.groups;
        if (
            typeof beforeTitle === 'undefined' ||
            typeof variant === 'undefined' ||
            typeof title === 'undefined'
        ) {
            throw new Error('Unknown error in parsing.');
        }
        const end = ASTNodePosition.getEnd(
            start,
            trimEndingNewline(match.matched),
        );
        const documentPart = new DocumentPart(variant, start, end, parent);
        const titleStart = ASTNodePosition.getEnd(start, beforeTitle);
        documentPart.addChildren(
            ...this.parseInlineContent(
                titleStart,
                documentPart,
                trimEndingNewline(title),
            ),
        );
        const metadata = this.parseMetablock(metablock);
        Object.keys(metadata).forEach(key =>
            documentPart.setMetadata(key, metadata[key]),
        );
        return {
            parsed: documentPart,
            after: `${getEndingNewline(match.matched)}${match.after}`,
        };
    }

    /**
     * Parse a document object
     *
     * @param start The position of the start of the document object
     * @param parent The parent node of the document object
     * @param source The source of the document object to be parsed
     * @returns A new document object along with the non-parsed source
     * remainder; or `undefined` if no document object could be parsed
     */
    private parseDocumentObject(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ParseResult<DocumentObject> | undefined {
        return this.parseDocumentObjectOrOuterEnv(
            start,
            parent,
            source,
            documentObjectMatcher,
            DocumentObject,
        );
    }

    /**
     * Parse an outer environment
     *
     * @param start The position of the start of the outer environment
     * @param parent The parent node of the outer environment
     * @param source The source of the outer environment to be parsed
     * @returns A new outer environment along with the non-parsed source
     * remainder; or `undefined` if no outer environment could be parsed
     */
    private parseOuterEnv(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ParseResult<OuterEnv> | undefined {
        return this.parseDocumentObjectOrOuterEnv(
            start,
            parent,
            source,
            outerEnvMatcher,
            OuterEnv,
        );
    }

    private parseDocumentObjectOrOuterEnv<T extends ASTNode>(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
        matcher: Matcher,
        NodeConstructor: new (
            variant: string,
            isFragile: boolean,
            start: ASTNodePosition,
            end: ASTNodePosition,
            parent?: ASTNode,
        ) => T,
    ): ParseResult<T> | undefined {
        const match = matcher.findFirstMatch(source);
        if (typeof match === 'undefined' || match.index !== 0) {
            return;
        }
        const [variant, metablock] = match.groups;
        if (typeof variant === 'undefined')
            throw new Error('Unknown error in parsing.');
        const end = ASTNodePosition.getEnd(
            start,
            trimEndingNewline(match.matched),
        );
        const node = new NodeConstructor(variant, false, start, end, parent);
        const metadata = this.parseMetablock(metablock);
        Object.keys(metadata).forEach(key =>
            node.setMetadata(key, metadata[key]),
        );
        return {
            parsed: node,
            after: `${getEndingNewline(match.matched)}${match.after}`,
        };
    }

    /**
     * Parse a fragile outer environment
     *
     * @param start The position of the start of the fragile outer environment
     * @param parent The parent node of the fragile outer environment
     * @param source The source of the fragile outer environment to be parsed
     * @returns A new fragile outer environment along with the non-parsed source
     * remainder; or `undefined` if no fragile outer environment could be parsed
     */
    private parseFragileOuterEnv(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ParseResult<OuterEnv> | undefined {
        const match = fragileOuterEnvMatcher.findFirstMatch(source);
        if (typeof match === 'undefined' || match.index !== 0) {
            return;
        }
        const [variant, metablock] = match.groups;
        if (typeof variant === 'undefined')
            throw new Error('Unknown error in parsing.');
        const end = ASTNodePosition.getEnd(
            start,
            trimEndingNewline(match.matched),
        );
        const node = new OuterEnv(variant, true, start, end, parent);
        const metadata = this.parseMetablock(metablock);
        Object.keys(metadata).forEach(key =>
            node.setMetadata(key, metadata[key]),
        );
        return {
            parsed: node,
            after: `${getEndingNewline(match.matched)}${match.after}`,
        };
    }

    /**
     * Parse the content of a fragile outer environment
     *
     * @param start The position of the start of the content
     * @param parent The parent node of the content
     * @param source The source of the content to be parsed
     * @returns A new text node along with the non-parsed source remainder
     */
    private parseFragileOuterEnvContent(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ParseResult<TextBlock> | undefined {
        if (!parent.isFragile) return;
        const match = textBlockSeparatorMatcher.findFirstMatch(source);
        const {before, after} = match ?? {before: source, after: ''};
        const end = ASTNodePosition.getEnd(start, before);
        const content = trimIndentation(before, start.column - 1);
        const textBlock = new TextBlock(true, start, end, parent);
        textBlock.addChildren(new TextNode(content, true, start, textBlock));
        return {
            parsed: textBlock,
            after: `${match?.matched ?? ''}${after}`,
        };
    }

    /**
     * Parse an indented block
     *
     * @param start The position of the start of the indented block
     * @param parent The parent node of the indented block
     * @param source The source of the indented block to be parsed
     * @returns A new indented block along with the non-parsed source remainder
     */
    private parseIndentedBlock(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ParseResult<IndentedBlock> | undefined {
        if (
            parent.children.length === 0 ||
            start.column <= parent.children[0].startColumn
        ) {
            return;
        }
        const match = textBlockSeparatorMatcher.findFirstMatch(source);
        const {before, after} = match ?? {before: source, after: ''};
        const end = ASTNodePosition.getEnd(start, before);
        let content = trimIndentation(before, start.column - 1);
        const metablockMatch = metablockMatcher.findFirstMatch(content);
        const metablock = metablockMatch?.matched ?? '';
        if (metablock.length > 0)
            content = trimEndingNewline(content.slice(0, -metablock.length));
        const indentedBlock = new IndentedBlock(false, start, end, parent);
        const metadata = this.parseMetablock(metablock);
        Object.keys(metadata).forEach(key =>
            indentedBlock.setMetadata(key, metadata[key]),
        );
        indentedBlock.addChildren(
            ...this.parseInlineContent(start, indentedBlock, content),
        );
        return {
            parsed: indentedBlock,
            after: `${match?.matched ?? ''}${after}`,
        };
    }

    /**
     * Parse a text block
     *
     * @param start The position of the start of the text block
     * @param parent The parent node of the text block
     * @param source The source of the text block to be parsed
     * @returns A new text block along with the non-parsed source remainder
     */
    private parseTextBlock(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): ParseResult<TextBlock> {
        const match = textBlockSeparatorMatcher.findFirstMatch(source);
        const {before, after} = match ?? {before: source, after: ''};
        const end = ASTNodePosition.getEnd(start, before);
        let content = trimIndentation(before, start.column - 1);
        const metablockMatch = metablockMatcher.findFirstMatch(content);
        const metablock = metablockMatch?.matched ?? '';
        if (metablock.length > 0)
            content = trimEndingNewline(content.slice(0, -metablock.length));
        const textBlock = new TextBlock(false, start, end, parent);
        const metadata = this.parseMetablock(metablock);
        Object.keys(metadata).forEach(key =>
            textBlock.setMetadata(key, metadata[key]),
        );
        textBlock.addChildren(
            ...this.parseInlineContent(start, textBlock, content),
        );
        return {parsed: textBlock, after: `${match?.matched ?? ''}${after}`};
    }

    /**
     * Parse a text node
     *
     * @param start The position of the start of the text node
     * @param parent The parent node of the text node
     * @param source The source of the text node to be parsed
     * @returns A new text node
     */
    private parseTextNode(
        start: ASTNodePosition,
        parent: ASTNode,
        source: string,
    ): TextNode {
        return new TextNode(source, false, start, parent);
    }
}
