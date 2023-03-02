import { cacheFile, getCachedFile, hasValidCache, sanitizePath } from './cache';

describe('test cache', () => {
  test('test write and read', async () => {
    const url =
      'https://github.githubassets.com:9090/test/assets/runtime-c69cb724710b.js';
    await cacheFile(url, 'sss');
    expect(hasValidCache(url)).toBe(true);
    const buf = await getCachedFile(url);
    expect(buf.toString()).toBe('sss');
  });
  test('valid cache', () => {
    const url =
      'https://github.githubassets.com:9090/test/assets/runtime-invalid.js';
    expect(hasValidCache(url)).toBe(false);
  });
});

describe('test utils', () => {
  test('test sanitize path', () => {
    const invalidWindowsFileName = 'a\\b/c:d*e?f"g<h>i|j';
    const sanitized = sanitizePath(invalidWindowsFileName);
    expect(sanitized).toBe('a%5Cb%2Fc%3Ad%2Ae%3Ff%22g%3Ch%3Ei%7Cj');
  });
});
