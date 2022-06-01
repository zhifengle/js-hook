import { e_user_hook } from './hook';
import { recordString } from './record-string';
import { searchByValue } from './search-string';

// 使用 rollup 打包成 iife. 集中初始化一些全局变量
function init() {
  if (!window) return;
  if (window.e_user_hook_done) return;
  window.e_user_string_db = [];
  window.e_user_execute_times = {};
  window.e_user_hook_fn_list = [];

  window.e_user_hook_fn_list.push(recordString);

  window.e_user_hook = e_user_hook;
  window.e_user_search = searchByValue;

  window.e_user_hook_done = true;
}
init();
