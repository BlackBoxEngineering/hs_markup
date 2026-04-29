# hs_markup

A lightweight, deterministic markup language and WYSIWYG editor for rich text. Zero HTML output — safe for on-chain storage, untrusted rendering, or anywhere you need a portable rich text format.

No ProseMirror. No Tiptap. No bloat. Works anywhere React runs.

## Markup Language

```
[t]Hello World[/t]
[b]Bold[/b] and [i]italic[/i]
[h1]Section Title[/h1]
[q]A quoted passage[/q]
[pre][code]const x = 1;[/code][/pre]
```

| Tag | Renders as | Purpose |
|------|------------|---------|
| `[t]` | styled span | Title |
| `[b]` | `<strong>` | Bold |
| `[i]` | `<em>` | Italic |
| `[u]` | `<u>` | Underline |
| `[s]` | `<s>` | Strikethrough |
| `[h]` | `<h2>` | Heading |
| `[h1]` `[h2]` `[h3]` | `<h1-3>` | Sized headings |
| `[hl]` | styled span | Highlight |
| `[code]` | `<code>` | Inline code |
| `[pre]` | `<pre>` | Code block |
| `[q]` | `<blockquote>` | Quote |

Newlines are literal `\n` — no special tag needed. The display container uses `white-space: pre-wrap`.

## Install

Not on npm yet. Install locally from the repo:

```bash
# from your project root
npm install ../hs_markup
```

Or add it to your `package.json` as a local dependency:

```json
{
  "dependencies": {
    "hs_markup": "file:../hs_markup"
  }
}
```

React 18+ is a peer dependency.

## API

### WYSIWYG Editor

A `contentEditable`-based editor with toolbar, theme support, and keyboard shortcuts (Ctrl/Cmd+B/I/U).

```tsx
import { HsMarkupEditor } from 'hs_markup';
import type { Theme } from 'hs_markup';

const theme: Theme = {
  background: '#fff',
  foreground: '#f5f5f5',
  text: '#111',
  highlight: '#e6a817',
  border: '#ccc',
  link: '#2563eb',
  green: '#16a34a',
  orange: '#ea580c',
  red: '#dc2626',
  shade: '#f0f0f0',
};

<HsMarkupEditor
  value={markup}
  onChange={setMarkup}
  currentTheme={theme}
  maxLength={1000}
  placeholder="Start typing..."
/>
```

`onChange` emits the raw markup string — always canonical short tags, never HTML.

### Renderer

Converts a markup string to React nodes for read-only display.

```tsx
import { transformContent } from 'hs_markup';

<div style={{ whiteSpace: 'pre-wrap' }}>
  {transformContent(markup)}
</div>
```

### Parser

Converts a markup string to an AST.

```ts
import { parseMarkup } from 'hs_markup';

const nodes = parseMarkup('[b]Hello[/b]');
// [{ type: 'element', tag: 'b', children: [{ type: 'text', value: 'Hello' }] }]
```

### Serialiser

Converts editor DOM back to a markup string.

```ts
import { displayToMarkup } from 'hs_markup';

const markup = displayToMarkup(editorElement);
```

### Tag Registry

```ts
import { TAGS, canonicalTag } from 'hs_markup';

TAGS['b'];           // { tag: 'b', element: 'strong' }
canonicalTag('bold'); // 'b'
canonicalTag('b');    // 'b'
```

## Legacy Tag Support

The parser and renderer accept both short and long-form tags. Legacy tags are normalised to their canonical short form on parse — the serialiser and editor never emit them.

| Legacy | Canonical |
|--------|-----------|
| `[bold]` | `[b]` |
| `[italic]` | `[i]` |
| `[underline]` | `[u]` |
| `[header]` | `[h]` |
| `[title]` | `[t]` |
| `[quote]` | `[q]` |
| `[highlight]` | `[hl]` |

## Architecture

```
src/
  language/    Tag registry and spec
  parser/      Markup string ↔ AST / editor DOM
  editor/      contentEditable WYSIWYG editor
  render/      Markup string → React components
  theme.ts     Theme type definition
  index.ts     Public API
```

The editor uses `data-tag` spans internally (`<span data-tag="b">`) rather than semantic HTML elements. This gives deterministic round-trips — `data-tag="b"` always serialises to `[b]...[/b]`, no browser normalisation issues.

Three core functions drive everything:
- `markupToEditorHTML(markup)` — load: markup → editor DOM
- `displayToMarkup(el)` — save: editor DOM → markup
- `applyFormat(tag)` — format: wrap selection in a tag

## Tests

```bash
npm install
npm test
```

36 tests covering parser behaviour, legacy tag normalisation, edge cases, and full round-trip integrity (`markup → editor DOM → markup`).

## License

MIT
