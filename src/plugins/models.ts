export enum Hooks {
  REFRESH_KEEP_ALIVE_PRE = 'REFRESH_KEEP_ALIVE_PRE',
  REFRESH_KEEP_ALIVE_POST = 'REFRESH_KEEP_ALIVE_POST'
}

export type ActionableHook = {
  hook: Hooks;
  action: (...args: any[]) => void;
};

export type CacheCandidatePlugin = {
  name: string;
  hooks: Array<ActionableHook>;
};
