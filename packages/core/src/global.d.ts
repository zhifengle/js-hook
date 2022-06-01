type HookCallType =
  | 'var-init'
  | 'function-parameter'
  | 'object-key-init'
  | 'assign';

type HookFn = (name: string, value: any, type: HookCallType) => void;

type StringDB = {
  name: string;
  value: string;
  type: HookCallType;
  execOrder: number;
  codeLocation: string;
};
interface Window {
  e_user_hook: HookFn;
  e_user_hook_done: boolean;
  e_user_search: (pattern: string | RegExp) => void;
  e_user_string_db: StringDB[];
  e_user_execute_times: Record<string, number>;
  e_user_hook_fn_list: HookFn[];
}
