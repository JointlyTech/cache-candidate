export const manager = {
  instances: new Map(),
  register: ({key, dependencyKeys, cacheAdapter}) => {
    for(const dependencyKey of dependencyKeys) {
      if (!manager.instances.has(dependencyKey)) {
        manager.instances.set(dependencyKey, [{
          key,
          cacheAdapter
        }]);
      } else {
        manager.instances.get(dependencyKey).push({
          key,
          cacheAdapter
        });
      }
    }
  },
  invalidate: ({dependencyKey}) => {
    manager.instances.get(dependencyKey).forEach(({key, cacheAdapter}) => {
      cacheAdapter.delete(key);
    });
  },
  deleteKey: ({dataCacheRecord}) => { 
    for (const [dependencyKey, keys] of manager.instances.entries()) {
      if(keys.some(_key => _key.key === dataCacheRecord.key)) {
        if(keys.length === 1) {
          manager.instances.delete(dependencyKey);
        } else {
          manager.instances.set(dependencyKey, keys.filter(_key => _key.key !== dataCacheRecord.key));
        }
      }
    }
  }
}

/*
[abc][1,2,3]
[def][3,4,5]

[1] => [abc]
[2] => [abc]
[3] => [abc, def]
[4] => [def]
[5] => [def]
*/