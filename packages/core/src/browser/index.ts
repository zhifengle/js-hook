import { e_user_hook } from './hook';
import { recordString } from './record-string';
import { initEvent, searchByMsg, searchNameByMsg } from './search-string';
import { init as initEval } from './eval-expressions';

// 使用 rollup 打包成 iife. 集中初始化一些全局变量
function init() {
  if (!window) return;
  if (window.e_user_hook_done) return;
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
  window.e_user_hook_done = true;
}
init();
