import {ASTNode} from '../../../core/ast/ast-node';
import {Renderer} from '../../../core/rendering/renderer';
import {RenderingManager} from '../../../core/rendering/rendering-manager';
import {WooElementKind} from '../../../util/types/woo';

export class InnerEnvMpopupRenderer implements Renderer {
    readonly kind: WooElementKind = 'InnerEnv';
    readonly abstractVariant = 'mpopup';

    render(renderingManager: RenderingManager, astNode: ASTNode): Node {
        const mpopup = document.createElement('em');
        mpopup.append(renderingManager.render(...astNode.children));
        return mpopup;
    }
}
