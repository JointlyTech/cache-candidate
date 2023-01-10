import { hook } from 'hook-fn';
import { CacheCandidatePlugin, Hooks, PluginPayload } from './models';

export function ExecuteHook(
  hook: Hooks,
  plugins: Array<CacheCandidatePlugin> = [],
  payload: PluginPayload
) {
  for (const plugin of plugins) {
    const actionableHook = plugin.hooks.find((h) => h.hook === hook);
    if (actionableHook) {
      actionableHook.action(payload);
    }
  }
}

export function pluginHookWrap(
  HookBefore: Hooks,
  HookAfter: Hooks,
  payload: PluginPayload
) {
  return hook({
    before: ({ args }) => {
      ExecuteHook(HookBefore, args[0].plugins, payload);
    },
    after: ({ args, result }) => {
      ExecuteHook(HookAfter, args[0].plugins, { ...payload, result });
    }
  });
}
