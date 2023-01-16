import {
  ActionableHook,
  CacheCandidatePluginWithAdditionalParameters,
  Hooks,
  PluginPayload
} from '@jointly/cache-candidate-plugin-base';
import { hook } from 'hook-fn';

export async function ExecuteHook(
  hook: Hooks,
  plugins: Array<CacheCandidatePluginWithAdditionalParameters> = [],
  payload: PluginPayload
) {
  for (const plugin of plugins) {
    const instanceHooks = plugin.hooks.filter((h) => h.hook === hook);
    if (instanceHooks.length > 1) {
      throw new Error(
        `Only one hook instance per plugin is allowed. ${plugin.name} has ${instanceHooks.length} instances of ${hook}}`
      );
    }
    if (instanceHooks.length === 0) {
      continue;
    }
    const instanceHook = instanceHooks[0];
    if (isActionable(instanceHook)) {
      await instanceHook.action(payload, plugin.additionalParameters);
    } else {
      throw new Error(
        `Hook ${hook} for plugin ${plugin.name} is not actionable.`
      );
    }
  }
}

function isActionable(hook: ActionableHook) {
  return [hook.action !== undefined, typeof hook.action === 'function'].every(
    (i) => i === true
  );
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
