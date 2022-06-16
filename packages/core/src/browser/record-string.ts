import { HOOK_FUCTION_NAME } from '../constants';

let execOrderCounter = 100000;

// https://github.com/CC11001100/ast-hook-for-js-RE/blob/master/src/components/global-assign-hook-component/plugins/string-put-to-db-plugins.js
function getCodeLocation(): string {
  const callstack = new Error().stack.split('\n');
  // 因为是硬编码判断的函数名，因此不能压缩代码
  // fn.displayName ??; Firefox 支持这个非标属性
  const idx = callstack.findIndex((str) => str.includes(HOOK_FUCTION_NAME));
  if (idx === -1) {
    return '';
  } else {
    if (isEvalStack(callstack, idx)) {
      if (
        callstack[idx + 3] &&
        callstack[idx + 3].includes('at Object.apply')
      ) {
        return callstack[idx + 4];
      } else {
        return callstack[idx + 2];
      }
    }
    return callstack[idx + 1] || '';
  }
}

// @TODO 索引是硬编码的. 代理对象逻辑变动也会导致这里变动;
// @TODO Function('a', 'b', 'return a+b') 有问题;
function isEvalStack(stack: string[], idx: number): boolean {
  return stack[idx + 1] && stack[idx + 1].includes('at eval (eval at apply');
}
function isObjectApplyStack(stack: string[], idx: number): boolean {
  return stack[idx + 3] && stack[idx + 3].includes('at Object.apply');
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
    codeLocation,
  });
  // 这个地方被执行的次数统计
  if (codeLocation && codeLocation in executeTimes) {
    executeTimes[codeLocation]++;
  } else {
    executeTimes[codeLocation] = 1;
  }
}
