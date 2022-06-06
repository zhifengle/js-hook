import { e_user_hook } from './hook';
import { recordString } from './record-string';
import { initEvent, searchByMsg, searchNameByMsg } from './search-string';
import { init as initEval } from './eval-expressions';

// 使用 rollup 打包成 iife. 集中初始化一些全局变量
function init(window: typeof globalThis) {
  if (!window) {
    console.warn('globalThis 为空');
    return;
  }
  window.e_user_string_db = [];
  window.e_user_execute_times = {};
  window.e_user_hook_fn_list = [];

  window.e_user_hook_fn_list.push(recordString);

  initEvent();
  initEval();
  window.e_user_hook = e_user_hook;
  window.search = window._search = window.e_user_search = searchByMsg;
  if (!window.search) {
    window.search = window.e_user_search;
  }
  if (!window._search) {
    window._search = window.e_user_search;
  }
  window.e_user_search_name = searchNameByMsg;
}
if (!globalThis.e_user_hook_done) {
  init(globalThis);
  // @ts-ignore; 打包成 iife。读取 iife 的内容
  globalThis.e_user_hook_iife = arguments.callee.toString();
  globalThis.e_user_hook_worker_list = [];
  globalThis.e_user_hook_done = true;
}
