export type TagDef = {
    tag: string;
    element: string;
    className?: string;
    legacy?: boolean;
    short?: string;
};
export declare const TAGS: Record<string, TagDef>;
/** Resolve a tag name to its canonical short tag. */
export declare function canonicalTag(tag: string): string;
