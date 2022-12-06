import { CacheCandidateCacheAdapter, DataCacheRecord } from '../models';

export const makeAsyncMap = (
  map: Map<string, DataCacheRecord> = new Map()
): CacheCandidateCacheAdapter => ({
  get: async (key: any) => map.get(JSON.stringify(key)),
  has: async (key: any) => map.has(JSON.stringify(key)),
  set: async (key: any, value: any) => map.set(JSON.stringify(key), value),
  delete: async (key: any) => map.delete(JSON.stringify(key))
});
