import { HOOK_FUCTION_NAME } from '../constants';

function hookEval2() {
  // 是否要在在控制台上打印eval hook日志提醒
  const enableEvalHookLog = true;

  // 用eval执行的代码也要能够注入，我擦开个接口吧...
  const evalHolder = window.eval;
  window.eval = function (jsCode) {
    if (enableEvalHookLog) {
      const isNeedNewLine = jsCode && jsCode.length > 100;
      console.log(
        'AST HOOK工具检测到eval执行代码： ' +
          (isNeedNewLine ? '\n' : '') +
          jsCode
      );
    }

    arguments[0] = fetchHookStr(jsCode);
    return evalHolder.apply(this, arguments);
  };

  window.eval.toString = function () {
    return 'function eval() { [native code] }';
  };
}

export function init() {
  hookEval();
  hookFunction();
  hookTimer('setTimeout');
  hookTimer('setInterval');
}

function fetchHookStr(str: string): string {
  var request = new XMLHttpRequest();
  request.open('POST', 'http://127.0.0.1:10010/hook-js-code', false);
  request.send(str);
  if (request.status === 200) {
    return request.responseText;
  } else {
    return str;
  }
}

function setDescriptor(fakeObj: any, prop: any) {
  Object.defineProperty(window, prop, {
    get: function () {
      return fakeObj;
    },
    set: function (v) {
      console.log(`检测到修改 ${prop}`);
    },
  });
}

function hookEval() {
  var fakeObj = new Proxy(window.eval, {
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

function hookTimer(prop: keyof WindowProxy) {
  var fakeObj = new Proxy(window[prop], {
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

  var fakeObj = new Proxy(window[prop], {
    get: function (target, p) {
      return Reflect.get(target, p);
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
