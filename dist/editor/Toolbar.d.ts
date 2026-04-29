import React from 'react';
import type { Theme } from '../theme';
type ToolbarProps = {
    editorRef: React.RefObject<HTMLDivElement | null>;
    onFormat: () => void;
    currentTheme: Theme;
};
export declare function Toolbar({ editorRef, onFormat, currentTheme }: ToolbarProps): import("react/jsx-runtime").JSX.Element;
export {};
