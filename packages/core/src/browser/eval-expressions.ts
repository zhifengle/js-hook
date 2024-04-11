import { HOOK_FUCTION_NAME } from '../constants';

let count = 1;

function genSourceStr(name: string = 'dynamicScript') {
  return `\n//# sourceURL=${location.origin}/${name}${count++}.js`;
}

export function init() {
  hookEval();
  hookFunction();
  hookTimer('setTimeout');
  hookTimer('setInterval');
  hookWorker();
}

function fetchHookStr(str: string): string {
  var request = new XMLHttpRequest();
  request.open('POST', 'http://127.0.0.1:10010/hook-js-code', false);
  request.send(str);
  if (request.status === 200) {
    return request.responseText + genSourceStr();
  } else {
    return str;
  }
}

function fetchWorkerStr(url: string): string {
  var request = new XMLHttpRequest();
  request.open('GET', url, false);
  request.send(null);
  if (request.status === 200) {
    return request.responseText;
  } else {
    console.error('获取出错');
    return '';
  }
}

function setDescriptor(fakeObj: any, prop: any) {
  Object.defineProperty(globalThis, prop, {
    get: function () {
      return fakeObj;
    },
    set: function (v) {
      console.log(`检测到修改 ${prop}`);
    },
  });
}

function hookEval() {
  var fakeObj = new Proxy(globalThis.eval, {
    get: function (target, p) {
      return Reflect.get(target, p);
    },
    apply: function (trapTarget, thisArg, argumentList) {
      const args = [...argumentList];
      args[0] = fetchHookStr(args[0]);
      return Reflect.apply(trapTarget, thisArg, args);
    },
  });
  setDescriptor(fakeObj, 'eval');
}

function hookTimer(prop: 'setTimeout' | 'setInterval') {
  var fakeObj = new Proxy(globalThis[prop], {
    get: function (target, p) {
      return Reflect.get(target, p);
    },
    apply: function (trapTarget, thisArg, argumentList) {
      if (typeof argumentList[0] === 'string') {
        const args = [...argumentList];
        args[0] = fetchHookStr(args[0]);
        return Reflect.apply(trapTarget, thisArg, args);
      }
      return Reflect.apply(trapTarget, thisArg, argumentList);
    },
  });
  setDescriptor(fakeObj, prop);
}

function hookFunction() {
  const prop = 'Function';

  var fakeObj = new Proxy(globalThis[prop], {
    get: function (target, p) {
      return Reflect.get(target, p);
    },
    construct(target, args) {
      args = [...args];
      const len = args.length;
      if (len === 0) {
        return new target(...args);
      }
      let body = args[len - 1];
      body = fetchHookStr(body);
      if (len > 1) {
        body =
          args
            .slice(0, len - 1)
            .map((arg) => {
              return `${HOOK_FUCTION_NAME}("${arg}",${arg},"function-parameter");`;
            })
            .join('') + body;
      }
      args[len - 1] = body;
      return new target(...args);
    },
    apply: function (trapTarget, thisArg, argumentList) {
      const len = argumentList.length;
      if (len === 0) {
        return Reflect.apply(trapTarget, thisArg, argumentList);
      }
      const args = [...argumentList];
      let body = args[len - 1];
      body = fetchHookStr(body);
      if (len > 1) {
        body =
          args
            .slice(0, len - 1)
            .map((arg) => {
              return `${HOOK_FUCTION_NAME}("${arg}",${arg},"function-parameter");`;
            })
            .join('') + body;
      }
      args[len - 1] = body;
      return Reflect.apply(trapTarget, thisArg, args);
    },
  });
  setDescriptor(fakeObj, prop);
}

function hookWorker() {
  var fakeObj = new Proxy(globalThis.Worker, {
    get: function (target, p) {
      return Reflect.get(target, p);
    },
    construct(target, args) {
      console.log('worker constructor called');
      args = [...args];
      // @TODO Worker options 情况没有兼顾
      var response = fetchWorkerStr(args[0]);
      // @TODO 硬编码判断是否注入
      if (!response.includes('globalThis.e_user_hook_done')) {
        response = `(${globalThis.e_user_hook_iife})();` + response;
      }
      var blob = new Blob([response], { type: 'application/javascript' });
      args[0] = URL.createObjectURL(blob);
      var worker = Reflect.construct(target, args);
      globalThis.e_user_hook_worker_list.push(worker);
      return worker;
    },
    apply: function (trapTarget, thisArg, argumentList) {
      const args = [...argumentList];
      args[0] = fetchHookStr(args[0]);
      return Reflect.apply(trapTarget, thisArg, args);
    },
  });
  setDescriptor(fakeObj, 'Worker');
}
