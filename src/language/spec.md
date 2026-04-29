# hs_markup Language Specification

## Overview
hs_markup is a deterministic, safe markup language for rich text. It uses square-bracket tags, produces no HTML, and is safe for on-chain storage.

## Tag Syntax
```
[tag]content[/tag]
```

## Supported Tags

| Tag       | Renders As    | Purpose         |
|-----------|---------------|-----------------|
| `[t]`     | `.hs-title`   | Title/heading   |
| `[b]`     | `<strong>`    | Bold            |
| `[i]`     | `<em>`        | Italic          |
| `[u]`     | `<u>`         | Underline       |
| `[s]`     | `<s>`         | Strikethrough   |
| `[h1]`    | `<h1>`        | Heading 1       |
| `[h2]`    | `<h2>`        | Heading 2       |
| `[h3]`    | `<h3>`        | Heading 3       |
| `[code]`  | `<code>`      | Inline code     |
| `[pre]`   | `<pre>`       | Code block      |
| `[q]`     | `<blockquote>`| Quote           |

## Rules
1. Tags must be properly closed: `[b]text[/b]`
2. Tags may be nested: `[b][i]bold italic[/i][/b]`
3. Unknown tags are rendered as plain text
4. No HTML is ever emitted or accepted
5. Newlines (`\n`) are preserved as line breaks

## Examples
```
[t]Hello World[/t]
[b]Bold[/b] and [i]italic[/i]
[h1]Section Title[/h1]
[q]A quoted passage[/q]
[pre][code]const x = 1;[/code][/pre]
```
