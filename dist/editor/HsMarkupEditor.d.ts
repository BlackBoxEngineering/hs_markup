import type { Theme } from '../theme';
type Props = {
    content: string;
    onChange: (markup: string) => void;
    currentTheme: Theme;
    maxLength?: number;
    placeholder?: string;
    className?: string;
};
export declare function HsMarkupEditor({ content, onChange, currentTheme, maxLength, placeholder, className, }: Props): import("react/jsx-runtime").JSX.Element;
export {};
