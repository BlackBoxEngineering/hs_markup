import { describe, it, expect } from 'vitest';
import { highlightCode } from '../src/render/highlight';

describe('highlightCode', () => {
  it('highlights JS keywords', () => {
    const nodes = highlightCode('const x = 1;', 'js');
    expect(nodes.length).toBeGreaterThan(1);
    const kw = nodes.find((n: any) => n?.props?.className === 'hs-hl-kw');
    expect(kw).toBeDefined();
  });

  it('highlights JS strings', () => {
    const nodes = highlightCode('"hello"', 'js');
    const str = nodes.find((n: any) => n?.props?.className === 'hs-hl-str');
    expect(str).toBeDefined();
  });

  it('highlights JS comments', () => {
    const nodes = highlightCode('// comment', 'js');
    const cmt = nodes.find((n: any) => n?.props?.className === 'hs-hl-cmt');
    expect(cmt).toBeDefined();
  });

  it('highlights JS function calls', () => {
    const nodes = highlightCode('foo()', 'js');
    const fn = nodes.find((n: any) => n?.props?.className === 'hs-hl-fn');
    expect(fn).toBeDefined();
  });

  it('highlights TS type keywords', () => {
    const nodes = highlightCode('type Foo = string;', 'ts');
    const kws = nodes.filter((n: any) => n?.props?.className === 'hs-hl-kw');
    expect(kws.length).toBeGreaterThanOrEqual(2); // type, string
  });

  it('highlights Solidity keywords', () => {
    const nodes = highlightCode('function f() public {}', 'sol');
    const kw = nodes.find((n: any) => n?.props?.className === 'hs-hl-kw');
    expect(kw).toBeDefined();
  });

  it('highlights Python keywords', () => {
    const nodes = highlightCode('def foo():\n  return True', 'py');
    const kws = nodes.filter((n: any) => n?.props?.className === 'hs-hl-kw');
    expect(kws.length).toBeGreaterThanOrEqual(2); // def, return, True
  });

  it('highlights Python hash comments', () => {
    const nodes = highlightCode('# comment', 'py');
    const cmt = nodes.find((n: any) => n?.props?.className === 'hs-hl-cmt');
    expect(cmt).toBeDefined();
  });

  it('highlights shell keywords', () => {
    const nodes = highlightCode('if [ -f foo ]; then echo "yes"; fi', 'sh');
    const kws = nodes.filter((n: any) => n?.props?.className === 'hs-hl-kw');
    expect(kws.length).toBeGreaterThanOrEqual(2); // if, then, echo, fi
  });

  it('highlights JSON keys and values', () => {
    const nodes = highlightCode('{"name": "test", "count": 42, "ok": true}', 'json');
    const fn = nodes.find((n: any) => n?.props?.className === 'hs-hl-fn'); // keys
    const str = nodes.find((n: any) => n?.props?.className === 'hs-hl-str'); // string values
    const num = nodes.find((n: any) => n?.props?.className === 'hs-hl-num'); // numbers
    const kw = nodes.find((n: any) => n?.props?.className === 'hs-hl-kw'); // true/false/null
    expect(fn).toBeDefined();
    expect(str).toBeDefined();
    expect(num).toBeDefined();
    expect(kw).toBeDefined();
  });

  it('returns plain text for unknown language', () => {
    const nodes = highlightCode('hello world', 'xyz');
    expect(nodes).toEqual(['hello world']);
  });

  it('returns plain text when no language', () => {
    const nodes = highlightCode('hello world', '');
    expect(nodes).toEqual(['hello world']);
  });

  it('preserves all original text content', () => {
    const code = 'const x = "hello";\n// comment\nfoo(42);';
    const nodes = highlightCode(code, 'js');
    const reconstructed = nodes.map((n: any) => typeof n === 'string' ? n : n.props.children).join('');
    expect(reconstructed).toBe(code);
  });
});
