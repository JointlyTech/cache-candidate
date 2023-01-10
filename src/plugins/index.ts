import { hook } from 'hook-fn';
import { CacheCandidatePlugin, Hooks } from './models';

export function ExecuteHook(
  hook: Hooks,
  plugins: Array<CacheCandidatePlugin> = [],
  ...args: any[]
) {
  for (const plugin of plugins) {
    const actionableHook = plugin.hooks.find((h) => h.hook === hook);
    if (actionableHook) {
      actionableHook.action(...args);
    }
  }
}

export function pippo(HookBefore: string, HookAfter: string) {
  return hook({
    before: ({ context, args }) => {
      console.log('before', HookBefore, args);
    },
    after: ({ context, args, result }) => {
      console.log('after', HookAfter, args);
    }
  });
}
