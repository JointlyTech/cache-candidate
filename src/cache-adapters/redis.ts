import { createClient } from 'redis';
import { CacheCandidateCacheAdapter } from '../models';

export const makeRedisCache = (
  client: ReturnType<typeof createClient>
): CacheCandidateCacheAdapter => {
  return {
    get: async (key: string) => {
      const resp = await client.get(key);
      return resp ? JSON.parse(resp) : undefined;
    },
    set: async (key: string, value: any, ttl: number) => {
      return client.set(key, JSON.stringify(value), {
        EX: ttl
      });
    },
    has: async (key: string) => {
      const resp = await client.get(key);
      return resp ? true : false;
    },
    delete: async (key: string) => {
      await client.del(key);
      return true;
    }
  };
};
