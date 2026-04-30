# hs_markup

Deterministic rich-text markup + editor for React.

No HTML storage. Canonical short tags. Stable round-trips.

## Why

- Deterministic: editor DOM serializes to canonical markup (`[b]`, `[code lg=js]`, etc.)
- Minimal: small API surface, no heavy editor framework dependency
- Auditable: plain-text markup, no hidden HTML artifacts

## Markup

```txt
[t]Hello World[/t]
[b]Bold[/b] and [i]italic[/i]
[h1]Section Title[/h1]
[q]A quoted passage[/q]
[code lg=js]const x = 1;[/code]
```

Supported tags:

- `[t]` title
- `[b]` bold
- `[i]` italic
- `[u]` underline
- `[s]` strike
- `[h]` heading
- `[h1]` `[h2]` `[h3]` headings
- `[hl]` highlight
- `[q]` quote
- `[code]` code block (optional `lg` metadata)

Code language allowlist (`lg`): `js`, `ts`, `sol`, `py`, `sh`, `json`.

Example:

```txt
[code lg=sol]function f() public {}[/code]
```

## Install

Not on npm yet. Install locally from the repo:

```bash
npm install ../hs_markup
```

Or add it to your `package.json`:

```json
{
  "dependencies": {
    "hs_markup": "file:../hs_markup"
  }
}
```

## Basic usage

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
  content={markup}
  onChange={setMarkup}
  currentTheme={theme}
  maxLength={1000}
  placeholder="Start typing..."
/>
```

`onChange` emits canonical markup only (never HTML).

## Read-only rendering

```tsx
import { transformContent } from 'hs_markup';

<div style={{ whiteSpace: 'pre-wrap' }}>
  {transformContent(markup)}
</div>
```

## API

- `HsMarkupEditor`
- `Toolbar`
- `applyFormat`
- `commands`
- `parseMarkup`
- `displayToMarkup`
- `transformContent`
- `highlightCode`, `highlightCSS`
- `TAGS`, `canonicalTag`

## Legacy tag compatibility

Accepted legacy tags are normalized to canonical short tags on parse.

- `[bold]` -> `[b]`
- `[italic]` -> `[i]`
- `[underline]` -> `[u]`
- `[header]` -> `[h]`
- `[title]` -> `[t]`
- `[quote]` -> `[q]`
- `[highlight]` -> `[hl]`

## Tests

```bash
npm test
```

Current suite includes parser, round-trip, tags, and highlighting tests.

## License

MIT
