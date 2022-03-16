import {ASTNode} from '../../../core/ast/ast-node';
import {Renderer} from '../../../core/rendering/renderer';
import {RenderingManager} from '../../../core/rendering/rendering-manager';
import {WooElementKind} from '../../../util/types/woo';

export class InnerEnvMpopupRenderer implements Renderer {
    readonly kind: WooElementKind = 'InnerEnv';
    readonly abstractVariant = 'mpopup';

    render(renderingManager: RenderingManager, astNode: ASTNode): Node {
        const children = renderingManager.render(...astNode.children);
        const element = document.createElement('span')
        // Warning: \color macro works like this only in MathJax v2.
        //          We need to change it when upgrading to MathJax v3.
        element.append(`\\color{blue}{${children.textContent ?? ''}}`)
        return element
    }
}
