import Koa from 'koa';
import Router from '@koa/router';
import koaBody from 'koa-body';
import { inject } from '@js-hook/core';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const app = new Koa();
const router = new Router();

router.post('/hook-js-code', koaBody(), async (ctx, next) => {
  //curl -i http://localhost:10010/hook-js-code -H "Content-Type: text/plain" -d "name=test"
  // 数据都是自己控制，不用 decodeURIComponent
  const jsCode = ctx.request.body;
  let hookStr = jsCode;
  try {
    hookStr = inject(jsCode);
  } catch (e) {
    console.error(e);
  }
  ctx.set('Content-Type', 'text/plain; charset=utf-8');
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', '*');

  ctx.body = hookStr;
});

app.use(router.routes()).use(router.allowedMethods());

const configPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(configPath)) {
  dotenv.config({
    path: configPath,
  });
} else {
  console.warn('配置文件不存在: ', configPath);
}
app.listen(process.env.SERVER_PORT || 10010);
