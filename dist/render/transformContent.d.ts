import React from 'react';
export type RendererMap = Partial<Record<string, React.ComponentType<{
    children?: React.ReactNode;
}>>>;
export declare function transformContent(markup: string, renderers?: RendererMap): React.ReactNode;
