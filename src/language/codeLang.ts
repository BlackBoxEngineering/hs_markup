export const CODE_LANGUAGES = new Set([
  'js',
  'ts',
  'sol',
  'py',
  'sh',
  'json',
]);

export function sanitiseCodeLanguage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalised = value.toLowerCase();
  return CODE_LANGUAGES.has(normalised) ? normalised : undefined;
}

