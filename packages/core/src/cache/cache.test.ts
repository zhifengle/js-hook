import { cacheFile, getCachedFile, hasValidCache } from './cache';

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
