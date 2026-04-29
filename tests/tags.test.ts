import { describe, it, expect } from 'vitest';
import { TAGS, canonicalTag } from '../src/language/tags';

describe('canonicalTag', () => {
  it('returns short tags unchanged', () => {
    const shortTags = ['t', 'b', 'i', 'u', 's', 'h', 'h1', 'h2', 'h3', 'hl', 'code', 'q'];
    for (const tag of shortTags) {
      expect(canonicalTag(tag)).toBe(tag);
    }
  });

  it('maps all legacy tags to their canonical short form', () => {
    expect(canonicalTag('title')).toBe('t');
    expect(canonicalTag('header')).toBe('h');
    expect(canonicalTag('bold')).toBe('b');
    expect(canonicalTag('italic')).toBe('i');
    expect(canonicalTag('underline')).toBe('u');
    expect(canonicalTag('quote')).toBe('q');
    expect(canonicalTag('highlight')).toBe('hl');
  });

  it('returns unknown tags as-is', () => {
    expect(canonicalTag('xyz')).toBe('xyz');
  });
});

describe('TAGS registry', () => {
  it('every legacy tag has a short mapping that exists in TAGS', () => {
    for (const [, def] of Object.entries(TAGS)) {
      if (def.legacy) {
        expect(def.short).toBeDefined();
        expect(TAGS[def.short!]).toBeDefined();
        expect(TAGS[def.short!].legacy).toBeUndefined();
      }
    }
  });

  it('legacy tags render to the same element as their canonical short tag', () => {
    for (const [, def] of Object.entries(TAGS)) {
      if (def.legacy && def.short) {
        const canonical = TAGS[def.short];
        expect(def.element).toBe(canonical.element);
        if (canonical.className) {
          expect(def.className).toBe(canonical.className);
        }
      }
    }
  });
});
