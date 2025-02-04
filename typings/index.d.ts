/// <reference types="draft-js" />

declare module 'draft-js-export-html' {
    import draftjs = require("draft-js");
    import Immutable = require("immutable");

    type BlockStyleFn = (block: draftjs.ContentBlock) => RenderConfig|undefined;
    type EntityStyleFn = (entity: draftjs.EntityInstance) => RenderConfig|undefined;
    type BlockRenderer = (block: draftjs.ContentBlock) => string;
    type RenderConfig = {
        element?: string;
        attributes?: any;
        style?: any;
    };

    export interface Options {
        defaultBlockTag?: string | null;
        inlineStyles?: { [styleName: string]: RenderConfig };
        blockRenderers?: { [blockType: string]: BlockRenderer };
        blockStyleFn?: BlockStyleFn;
        entityStyleFn?: EntityStyleFn;
        inlineStyleFn?: (styles: Immutable.OrderedSet<string>) => RenderConfig | null;
    }

    export function stateToHTML(content: draftjs.ContentState, options?: Options): string;
}
