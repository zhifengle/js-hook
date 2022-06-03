import {
  inject,
  getCachedFile,
  hasValidCache,
  cacheFile,
  removeFile,
} from '@js-hook/core';
import fs from 'fs';
import { JSDOM } from 'jsdom';

function getDocObj(htmlStr: string): Document {
  const dom = new JSDOM(htmlStr);
  return dom.window.document;
}

function prependBrowserScript(str: string, ruleValue: string) {
  let hookStr = str;
  if (ruleValue.startsWith('hook-js')) {
    hookStr =
      fs
        .readFileSync(require.resolve('@js-hook/core/dist/browser'))
        .toString() + hookStr;
  }
  return hookStr;
}

function getJsHookStr(url: string, body: Buffer, ruleValue: string): string {
  let resStr = body.toString();
  let hookStr = '';
  const noCache = ruleValue.includes('no-cache');
  if (hasValidCache(url) && !noCache) {
    console.log('url: has cache', url);
    hookStr = getCachedFile(url).toString();
  } else {
    try {
      hookStr = inject(resStr);
      hookStr = prependBrowserScript(hookStr, ruleValue);
      if (noCache) {
        removeFile(url);
        return hookStr;
      }
      cacheFile(url, hookStr);
    } catch (error) {}
  }
  return hookStr;
}

function genHTMLResponse(htmlStr: string, ruleValue: string): string {
  const doc = getDocObj(htmlStr);
  doc.querySelectorAll('script').forEach((script) => {
    if (script.src || !script.innerHTML) {
      return;
    }
    // 移除 CSP 校验
    script.removeAttribute('integrity');
    script.removeAttribute('nonce');
    try {
      let hookStr = inject(script.innerHTML);
      hookStr = prependBrowserScript(hookStr, ruleValue);
      script.innerHTML = hookStr;
    } catch (error) {}
  });
  return doc.documentElement.outerHTML;
}

function handleReq(
  req: Whistle.PluginServerRequest,
  res: Whistle.PluginServerResponse
) {
  // do something
  const { ruleValue } = req.originalReq;
  const urlObj = new URL(req.fullUrl);

  if (ruleValue.startsWith('hook')) {
    // 简单处理，不支持各种编码，省得对响应内容进行解码
    delete req.headers['accept-encoding'];
    // svrRes 是 IncomingMessage ??
    const client = req.request((svrRes: any) => {
      // 由于内容长度可能有变，删除长度自动改成 chunked
      delete svrRes.headers['content-length'];
      res.writeHead(svrRes.statusCode, svrRes.headers);

      let body: any;
      svrRes.on('data', (data: any) => {
        body = body ? Buffer.concat([body, data]) : data;
      });
      svrRes.on('end', async () => {
        if (svrRes.statusCode === 404) {
          res.end(body);
          return;
        }
        if (body) {
          const typeHeader = svrRes.headers['content-type'];
          if (
            urlObj.pathname.endsWith('js') ||
            typeHeader.includes('javascript')
          ) {
            console.log('----------- 转换js响应 ---------------');
            console.log(req.fullUrl);
            let hookStr = getJsHookStr(req.fullUrl, body, ruleValue);
            // await new Promise((r) => setTimeout(r, 5000));
            // console.log('----------- 响应完成 ---------------');
            res.end(hookStr);
          } else if (typeHeader.includes('text/html')) {
            console.log('----------- 转换HTML响应 ---------------');
            console.log(req.fullUrl);
            let hookStr = genHTMLResponse(body.toString(), ruleValue);
            res.end(hookStr);
          } else {
            res.end(body);
          }
        } else {
          res.end();
        }
      });
    });
    req.pipe(client);
  } else {
    req.passThrough();
  }
}

export default (
  server: Whistle.PluginServer,
  options: Whistle.PluginOptions
) => {
  // handle http request
  server.on('request', handleReq);

  // handle websocket request
  server.on(
    'upgrade',
    (req: Whistle.PluginServerRequest, socket: Whistle.PluginServerSocket) => {
      // do something
      req.passThrough();
    }
  );

  // handle tunnel request
  server.on(
    'connect',
    (req: Whistle.PluginServerRequest, socket: Whistle.PluginServerSocket) => {
      // do something
      req.passThrough();
    }
  );
};
