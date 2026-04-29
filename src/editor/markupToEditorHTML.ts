import { TAGS, canonicalTag } from '../language/tags';

const TAG_NAMES = Object.keys(TAGS).join('|');
const TAG_RE = new RegExp(`\\[(\\/?(${TAG_NAMES}))\\]`, 'g');

// Tags that must preserve literal \n instead of converting to <br>
const PRESERVE_WHITESPACE_TAGS = new Set(['code', 'pre']);

/**
 * Converts markup string → editor-safe innerHTML.
 * Each tagged span carries data-tag (always the canonical short form)
 * so displayToMarkup can round-trip it.
 * Inside code/pre spans, \n is kept as a literal newline (white-space: pre handles it).
 * Outside those spans, \n is converted to <br>.
 */
export function markupToEditorHTML(markup: string): string {
  // First escape HTML entities
  const escaped = markup
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Process tag by tag, tracking whether we're inside a whitespace-preserving tag
  let result = '';
  let lastIndex = 0;
  let insidePreserve = false;

  const re = new RegExp(`\\[(\\/?(${TAG_NAMES}))\\]`, 'g');
  let match: RegExpExecArray | null;

  while ((match = re.exec(escaped)) !== null) {
    const before = escaped.slice(lastIndex, match.index);
    // convert newlines in the text segment based on current context
    result += insidePreserve ? before : before.replace(/\n/g, '<br>');

    const full = match[1];
    if (full.startsWith('/')) {
      const closingTag = canonicalTag(full.slice(1));
      if (PRESERVE_WHITESPACE_TAGS.has(closingTag)) insidePreserve = false;
      result += '</span>';
    } else {
      const tag = canonicalTag(full);
      if (PRESERVE_WHITESPACE_TAGS.has(tag)) insidePreserve = true;
      result += `<span data-tag="${tag}">`;
    }

    lastIndex = match.index + match[0].length;
  }

  // remaining text after last tag
  const tail = escaped.slice(lastIndex);
  result += insidePreserve ? tail : tail.replace(/\n/g, '<br>');

  return result;
}
