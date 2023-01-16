import { CacheCandidatePlugin, Hooks } from '../models';
import { cacheCandidateDependencyManager } from './manager';

export const PluginDependencyKeys: CacheCandidatePlugin = {
  name: 'dependencyKeys',
  hooks: [
    {
      hook: Hooks.DATACACHE_RECORD_DELETE_POST,
      action: async ({ key }) => {
        cacheCandidateDependencyManager.deleteKey(key);
      }
    },
    {
      hook: Hooks.DATACACHE_RECORD_ADD_POST,
      action: async ({ options, key, result }, additionalParameters) => {
        if (!additionalParameters.dependencyKeys) return;
        let dependencyKeys: any = additionalParameters.dependencyKeys;
        dependencyKeys = await remapDependencyKeys(dependencyKeys, result);
        cacheCandidateDependencyManager.register({
          key,
          dependencyKeys,
          cacheAdapter: options.cache
        });
      }
    }
  ]
};

async function remapDependencyKeys(dependencyKeys: any, result: unknown) {
  if (typeof dependencyKeys === 'function') {
    dependencyKeys = dependencyKeys(result);
    if (dependencyKeys instanceof Promise) {
      dependencyKeys = await dependencyKeys;
    }
  }

  if (Array.isArray(dependencyKeys)) {
    dependencyKeys = dependencyKeys.map((key) => {
      return typeof key === 'number' ? key.toString() : key;
    });
  }

  if (typeof dependencyKeys === 'number') {
    dependencyKeys = [dependencyKeys.toString()];
  }

  if (typeof dependencyKeys === 'string') {
    dependencyKeys = [dependencyKeys];
  }
  return dependencyKeys;
}
