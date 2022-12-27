import { CacheCandidateCacheAdapter } from '../models';

const makeDependencyManager = () => {
  const instances = new Map();
  return {
    register: ({
      key,
      dependencyKeys,
      cacheAdapter
    }: {
      key: unknown;
      dependencyKeys: Array<string>;
      cacheAdapter: CacheCandidateCacheAdapter;
    }) => {
      for (const dependencyKey of dependencyKeys) {
        if (!instances.has(dependencyKey)) {
          instances.set(dependencyKey, [
            {
              key,
              cacheAdapter
            }
          ]);
        } else {
          instances.get(dependencyKey).push({
            key,
            cacheAdapter
          });
        }
      }
    },
    invalidate: (dependencyKey: string | number) => {
      if (typeof dependencyKey === 'number') {
        dependencyKey = dependencyKey.toString();
      }

      if (!instances.has(dependencyKey)) {
        return;
      }

      instances.get(dependencyKey).forEach(({ key, cacheAdapter }) => {
        cacheAdapter.delete(key);
      });
    },
    deleteKey: (dataCacheRecordKey: string) => {
      for (const [dependencyKey, keys] of instances.entries()) {
        if (keys.some((_key) => _key.key === dataCacheRecordKey)) {
          if (keys.length === 1) {
            instances.delete(dependencyKey);
          } else {
            instances.set(
              dependencyKey,
              keys.filter((_key) => _key.key !== dataCacheRecordKey)
            );
          }
        }
      }
    },
    instances
  };
};

export const cacheCandidateDependencyManager = makeDependencyManager();

/*
[abc][1,2,3]
[def][3,4,5]

[1] => [abc]
[2] => [abc]
[3] => [abc, def]
[4] => [def]
[5] => [def]
*/
