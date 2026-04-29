import { TAGS, canonicalTag } from '../language/tags';

const TAG_NAMES = Object.keys(TAGS).join('|');
const TAG_RE = new RegExp(`\\[(\\/?(${TAG_NAMES}))\\]`, 'g');

/**
 * Converts markup string → editor-safe innerHTML.
 * Each tagged span carries data-tag (always the canonical short form)
 * so displayToMarkup can round-trip it.
 */
export function markupToEditorHTML(markup: string): string {
  return markup
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(TAG_RE, (_match, full: string) => {
      if (full.startsWith('/')) {
        return '</span>';
      }
      const tag = canonicalTag(full);
      return `<span data-tag="${tag}">`;
    })
    .replace(/\n/g, '<br>');
}
