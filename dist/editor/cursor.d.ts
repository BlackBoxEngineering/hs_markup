/**
 * Character-offset cursor strategy.
 * Walks text nodes in DOM order to convert between
 * (node, offset) ↔ integer character offset from root.
 * Survives innerHTML replacement because it holds no node references.
 */
export declare function getCursorOffset(root: HTMLElement): number | null;
export declare function setCursorOffset(root: HTMLElement, offset: number): void;
