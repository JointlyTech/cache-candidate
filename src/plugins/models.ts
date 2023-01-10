export type PluginPayload = {
  options: any;
  key: string;
  keepAliveTimeoutCache: any;
  runningQueryCache: any;
  timeframeCache: any;
  fnArgs: any[];
  result?: any;
};

export enum Hooks {
  INIT = 'INIT',
  EXECUTION_PRE = 'EXECUTION_PRE',
  EXECUTION_POST = 'EXECUTION_POST',
  DATACACHE_RECORD_ADD_PRE = 'DATACACHE_RECORD_ADD_PRE',
  DATACACHE_RECORD_ADD_POST = 'DATACACHE_RECORD_ADD_POST',
  //DATACACHE_RECORD_DELETE_PRE = 'DATACACHE_RECORD_DELETE_PRE',
  //DATACACHE_RECORD_DELETE_POST = 'DATACACHE_RECORD_DELETE_POST',
  CACHE_HIT = 'CACHE_HIT'
  //CACHE_MISS = 'CACHE_MISS',
}

export type ActionableHook = {
  hook: Hooks;
  action: (payload: PluginPayload) => void;
};

export type CacheCandidatePlugin = {
  name: string;
  hooks: Array<ActionableHook>;
};
