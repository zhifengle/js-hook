import { HOOK_FUCTION_NAME } from '../constants';

let execOrderCounter = 100000;

// https://github.com/CC11001100/ast-hook-for-js-RE/blob/master/src/components/global-assign-hook-component/plugins/string-put-to-db-plugins.js
function getCodeLocation(): string {
  const callstack = new Error().stack.split('\n');
  while (
    callstack.length > 0 &&
    callstack[0].indexOf(HOOK_FUCTION_NAME) === -1
  ) {
    callstack.shift();
  }
  if (callstack.length < 2) {
    return '';
  }
  callstack.shift();
  return callstack.shift();
}

export function recordString(name: string, value: any, type: HookCallType) {
  const varValueDb = globalThis.e_user_string_db;
  const executeTimes = globalThis.e_user_execute_times;
  // 现在只记录字符串
  if (!value || typeof value !== 'string') {
    return;
  }
  const codeLocation = getCodeLocation();
  varValueDb.push({
    name,
    value,
    type,
    execOrder: execOrderCounter++,
    codeLocation: getCodeLocation(),
  });
  // 这个地方被执行的次数统计
  if (codeLocation in executeTimes) {
    executeTimes[codeLocation]++;
  } else {
    executeTimes[codeLocation] = 1;
  }
}
