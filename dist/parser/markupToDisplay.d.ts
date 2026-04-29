export type MarkupNode = {
    type: 'text';
    value: string;
} | {
    type: 'element';
    tag: string;
    children: MarkupNode[];
};
export declare function parseMarkup(input: string): MarkupNode[];
