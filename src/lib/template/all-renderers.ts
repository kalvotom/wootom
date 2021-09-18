import {rendererRegistry} from '../core';
import {DocumentObjectAlgorithmRenderer} from './renderers/document-object/algorithm';
import {DocumentObjectCorollaryRenderer} from './renderers/document-object/corollary';
import {DefaultDocumentObjectRenderer} from './renderers/document-object/default';
import {DocumentObjectDefinitionRenderer} from './renderers/document-object/definition';
import {DocumentObjectExampleRenderer} from './renderers/document-object/example';
import {DocumentObjectFigureRenderer} from './renderers/document-object/figure';
import {DocumentObjectLemmaRenderer} from './renderers/document-object/lemma';
import {DocumentObjectObservationRenderer} from './renderers/document-object/observation';
import {DocumentObjectProofRenderer} from './renderers/document-object/proof';
import {DocumentObjectPropositionRenderer} from './renderers/document-object/proposition';
import {DocumentObjectQuestionRenderer} from './renderers/document-object/question';
import {DocumentObjectRemarkRenderer} from './renderers/document-object/remark';
import {DocumentObjectSolutionRenderer} from './renderers/document-object/solution';
import {DocumentObjectTableRenderer} from './renderers/document-object/table';
import {DocumentObjectTheoremRenderer} from './renderers/document-object/theorem';
import {DocumentObjectWarningRenderer} from './renderers/document-object/warning';
import {DefaultDocumentPartRenderer} from './renderers/document-part/default';
import {DocumentPartH1Renderer} from './renderers/document-part/h1';
import {DocumentPartH2Renderer} from './renderers/document-part/h2';
import {DocumentPartH3Renderer} from './renderers/document-part/h3';
import {InnerEnvBRenderer} from './renderers/inner-env/b';
import {InnerEnvCiteRenderer} from './renderers/inner-env/cite';
import {InnerEnvCodeRenderer} from './renderers/inner-env/code';
import {DefaultInnerEnvRenderer} from './renderers/inner-env/default';
import {InnerEnvEqrefRenderer} from './renderers/inner-env/eqref';
import {InnerEnvFootnoteRenderer} from './renderers/inner-env/footnote';
import {InnerEnvIRenderer} from './renderers/inner-env/i';
import {InnerEnvInlineMathRenderer} from './renderers/inner-env/inline-math';
import {InnerEnvQuotedRenderer} from './renderers/inner-env/quoted';
import {InnerEnvReferenceRenderer} from './renderers/inner-env/reference';
import {InnerEnvSmallRenderer} from './renderers/inner-env/small';
import {InnerEnvURenderer} from './renderers/inner-env/u';
import {InnerEnvIndexRenderer} from './renderers/inner-env/_index';
import {InnerEnvUReferenceRenderer} from './renderers/inner-env/_reference';
import {DocumentRootRenderer} from './renderers/other/document-root';
import {IndentedBlockRenderer} from './renderers/other/indented-block';
import {InlineMathRenderer} from './renderers/other/inline-math';
import {TextBlockRenderer} from './renderers/other/text-block';
import {TextNodeRenderer} from './renderers/other/text-node';
import {OuterEnvAlignMathRenderer} from './renderers/outer-env/align-math';
import {OuterEnvBlockMathRenderer} from './renderers/outer-env/block-math';
import {OuterEnvCaptionRenderer} from './renderers/outer-env/caption';
import {OuterEnvCodeblockRenderer} from './renderers/outer-env/codeblock';
import {DefaultOuterEnvRenderer} from './renderers/outer-env/default';
import {OuterEnvGatherMathRenderer} from './renderers/outer-env/gather-math';
import {OuterEnvQuoteRenderer} from './renderers/outer-env/quote';
import {OuterEnvSageRenderer} from './renderers/outer-env/sage';
import {OuterEnvSolutionRenderer} from './renderers/outer-env/solution';
import {OuterEnvTabularRenderer} from './renderers/outer-env/tabular';
import {OuterEnvTikzRenderer} from './renderers/outer-env/tikz';

export function registerTemplateRenderers(): void {
    rendererRegistry.setRenderer(new DocumentRootRenderer());
    rendererRegistry.setRenderer(new IndentedBlockRenderer());
    rendererRegistry.setRenderer(new InlineMathRenderer());
    rendererRegistry.setRenderer(new TextBlockRenderer());
    rendererRegistry.setRenderer(new TextNodeRenderer());

    rendererRegistry.setRenderer(new DefaultDocumentPartRenderer());
    rendererRegistry.setRenderer(new DocumentPartH1Renderer());
    rendererRegistry.setRenderer(new DocumentPartH2Renderer());
    rendererRegistry.setRenderer(new DocumentPartH3Renderer());

    rendererRegistry.setRenderer(new DefaultDocumentObjectRenderer());
    rendererRegistry.setRenderer(new DocumentObjectAlgorithmRenderer());
    rendererRegistry.setRenderer(new DocumentObjectDefinitionRenderer());
    rendererRegistry.setRenderer(new DocumentObjectCorollaryRenderer());
    rendererRegistry.setRenderer(new DocumentObjectLemmaRenderer());
    rendererRegistry.setRenderer(new DocumentObjectObservationRenderer());
    rendererRegistry.setRenderer(new DocumentObjectPropositionRenderer());
    rendererRegistry.setRenderer(new DocumentObjectTheoremRenderer());
    rendererRegistry.setRenderer(new DocumentObjectProofRenderer());
    rendererRegistry.setRenderer(new DocumentObjectRemarkRenderer());
    rendererRegistry.setRenderer(new DocumentObjectExampleRenderer());
    rendererRegistry.setRenderer(new DocumentObjectFigureRenderer());
    rendererRegistry.setRenderer(new DocumentObjectQuestionRenderer());
    rendererRegistry.setRenderer(new DocumentObjectSolutionRenderer());
    rendererRegistry.setRenderer(new DocumentObjectTableRenderer());
    rendererRegistry.setRenderer(new DocumentObjectWarningRenderer());

    rendererRegistry.setRenderer(new DefaultOuterEnvRenderer());
    rendererRegistry.setRenderer(new OuterEnvAlignMathRenderer());
    rendererRegistry.setRenderer(new OuterEnvCaptionRenderer());
    rendererRegistry.setRenderer(new OuterEnvCodeblockRenderer());
    rendererRegistry.setRenderer(new OuterEnvBlockMathRenderer());
    rendererRegistry.setRenderer(new OuterEnvGatherMathRenderer());
    rendererRegistry.setRenderer(new OuterEnvSageRenderer());
    rendererRegistry.setRenderer(new OuterEnvSolutionRenderer());
    rendererRegistry.setRenderer(new OuterEnvTabularRenderer());
    rendererRegistry.setRenderer(new OuterEnvTikzRenderer());
    rendererRegistry.setRenderer(new OuterEnvQuoteRenderer());

    rendererRegistry.setRenderer(new DefaultInnerEnvRenderer());
    rendererRegistry.setRenderer(new InnerEnvCiteRenderer());
    rendererRegistry.setRenderer(new InnerEnvCodeRenderer());
    rendererRegistry.setRenderer(new InnerEnvIRenderer());
    rendererRegistry.setRenderer(new InnerEnvEqrefRenderer());
    rendererRegistry.setRenderer(new InnerEnvFootnoteRenderer());
    rendererRegistry.setRenderer(new InnerEnvInlineMathRenderer());
    rendererRegistry.setRenderer(new InnerEnvBRenderer());
    rendererRegistry.setRenderer(new InnerEnvQuotedRenderer());
    rendererRegistry.setRenderer(new InnerEnvReferenceRenderer());
    rendererRegistry.setRenderer(new InnerEnvSmallRenderer());
    rendererRegistry.setRenderer(new InnerEnvURenderer());

    rendererRegistry.setRenderer(new InnerEnvIndexRenderer());
    rendererRegistry.setRenderer(new InnerEnvUReferenceRenderer());
}
