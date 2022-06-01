import { inject, getCachedFile, hasValidCache, cacheFile } from 'js-hook';

function getJsHookStr(url: string, body: Buffer) {
  let resStr = body.toString();
  let hookStr = '';
  if (hasValidCache(url)) {
    console.log('url: has cache', url);
    hookStr = getCachedFile(url).toString();
  } else {
    try {
      hookStr = inject(resStr);
      cacheFile(url, hookStr);
    } catch (error) {}
  }
  return hookStr;
}

function handleReq(
  req: Whistle.PluginServerRequest,
  res: Whistle.PluginServerResponse
) {
  // do something
  const { ruleValue } = req.originalReq;
  const urlObj = new URL(req.fullUrl);
  console.log(req.originalReq.headers);
  if (ruleValue === 'hook' && urlObj.pathname.endsWith('js')) {
    // 简单处理，不支持各种编码，省得对响应内容进行解码
    delete req.headers['accept-encoding'];
    const client = req.request((svrRes: any) => {
      // 由于内容长度可能有变，删除长度自动改成 chunked
      delete svrRes.headers['content-length'];
      res.writeHead(svrRes.statusCode, svrRes.headers);

      let body: any;
      svrRes.on('data', (data: any) => {
        body = body ? Buffer.concat([body, data]) : data;
      });
      svrRes.on('end', async () => {
        if (body) {
          console.log('----------- 处理响应 ---------------');
          console.log(req.fullUrl);
          const hookStr = getJsHookStr(req.fullUrl, body);
          // await new Promise((r) => setTimeout(r, 5000));
          // console.log('----------- 响应完成 ---------------');
          res.end(hookStr);
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
