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
declare module globalThis {
  var e_user_hook_iife: string;
  var e_user_hook: HookFn;
  var e_user_hook_done: boolean;
  var e_user_search: (pattern: string | RegExp) => void;
  var e_user_search_name: (pattern: string | RegExp) => void;
  var search: (pattern: string | RegExp) => void;
  var _search: (pattern: string | RegExp) => void;
  var e_user_string_db: StringDB[];
  var e_user_execute_times: Record<string, number>;
  var e_user_hook_fn_list: HookFn[];
  var e_user_hook_worker_list: Worker[];
}
