import { applyFormat } from './applyFormat';

export const commands = {
  bold:          () => applyFormat('b'),
  italic:        () => applyFormat('i'),
  underline:     () => applyFormat('u'),
  strikethrough: () => applyFormat('s'),
  title:         () => applyFormat('t'),
  heading:       () => applyFormat('h'),
  h1:            () => applyFormat('h1'),
  h2:            () => applyFormat('h2'),
  h3:            () => applyFormat('h3'),
  code:          () => applyFormat('code'),
  quote:         () => applyFormat('q'),
  highlight:     () => applyFormat('hl'),
};
