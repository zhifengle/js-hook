export function e_user_hook(name: string, value: any, type: HookCallType) {
  try {
    // 注入的操作
    _hook(name, value, type);
  } catch (e) {
    console.error(e);
  }
  return value;
}

function _hook(name: string, value: any, type: HookCallType) {
  for (let callback of globalThis.e_user_hook_fn_list) {
    try {
      callback(name, value, type);
    } catch (e) {
      console.error(e);
    }
  }
}
