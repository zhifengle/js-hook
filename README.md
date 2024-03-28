# js-hook

解析 JavaScript 的 AST，添加自定义的钩子。

逻辑和思路参考 [JSREI/ast-hook-for-js-RE: 浏览器内存漫游解决方案（探索中...）](https://github.com/JSREI/ast-hook-for-js-RE)

出于学习的目的，用 TypeScript 按照自己的理解重写了一遍。

主要改动

- 使用 [avwo/whistle](https://github.com/avwo/whistle) 作为拦截代理
  1. [alibaba/anyproxy](https://github.com/alibaba/anyproxy) 好像没人维护了
  2. whistle 的规则功能比较灵活，可以按需配置要处理的 JS 的文件。比如不需要处理 jquery 文件，就设置规则排除。规则参考看下文。
  3. whistle 能够避免和代理软件冲突
- 调整的资源的缓存方式，资源缓存在用户目录下面的 `.cache/js-hook-cache`。按照域名和资源路径保存。
- 支持 Web Worker
- 添加构建和变量配置

TODO

- [x] 针对 `eval expressions` 的处理。
  - 这里指的是 eval Function, setTimeout, setInterval
  - 参考链接: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_eval_expressions
- [ ] 优化速度，使用 Rust 版本的 babel: `swc`。直接使用 `@swc/core` 或者用 Rust 实现
  - 可能会鸽。
- [ ] 保存 hook 数据的历史记录，对比前后两次的调用。

## 使用

安装 [avwo/whistle](https://github.com/avwo/whistle). whistle 的配置请参考官方文档

项目使用 [pnpm](https://pnpm.io/) 管理依赖。 [安装文档](https://pnpm.io/installation)

```bash
pnpm install
# 构建项目，然后将本项目里面的 whistle.hook-server 插件 link 到全局的依赖。方便 whistle 读取
# 同时运行 packages/server 服务
pnpm run start
```
完成 whistle 的安装和配置代理 `127.0.0.1:8899`，并在本地运行本项目。

打开 http://127.0.0.1:8899/#rules 配置规则

以 cn.bing.com 为例子，规则如下

```conf
cn.bing.com hook-server://hook
```

规则配置完成后，浏览器打开 https://cn.bing.com ，F12 打开开发者工具。控制台现在能使用 search('xxx') 了

具体原理就是：访问 cn.bing.com，会访问中间代理 `127.0.0.1:8899`，如果配置了 `cn.bing.com hook-server://hook`
中间代理响应请求时，会执行本项目的 hook-server 注入 JS 代码。

> [!IMPORTANT]  
> 然后打开 whistle 的规则配置页面 http://127.0.0.1:8899/#rules 配置好 hook-server 规则。才能正常使用

具体设置，参考下面的 [whistle 的规则参考](#whistle-rules)

## packages/core

解析 AST，添加变量赋值，函数参数，对象属性值初始化等的钩子。

其中 `browser` 是需要在浏览器端运行的依赖和自定义拦截。

## packages/server

提供一个接口，当检测浏览器端有 `eval expressions` 时，调用这个接口，返回添加钩子的结果

## packages/whistle.hook-server

目前内置了四种规则 `hook` `hook-js` `hook-no-cache` `hook-js-no-cache`。

- `hook`: 解析修改 JavaScript 文件。在 HTML 文件的头部插入运行依赖.
- `hook-js`: 解析修改 JavaScript 文件并在每一个 JS 文件头部插入运行依赖
- `hook-no-cache`: 同 `hook`，只是没有缓存解析后的 JS 文件。
- `hook-js-no-cache`: 同 `hook`，只是没有缓存解析后的 JS 文件。

### whistle-rules

whistle 的规则参考

```conf
# 需要 SwitchyOmega 的规则配置 <-loopback>。设置参考 packages/demos 部分的说明
localhost hook-server://hook excludeFilter:///jquery/
# 使用正则排除链接里面包含 jquery 的文件
# 这里自定义的 m.com 域名。需要利用 Nginx。设置参考最下面
m.com hook-server://hook excludeFilter:///jquery/

# 统计脚本返回 404；
https://hm.baidu.com statusCode://404
# 返回 404；这些都是反调试的脚本
/match.yuanrenxue.com\/static\/match\/safety\/.*.js/ statusCode://404
match.yuanrenxue.com hook-server://hook-js excludeFilter:///jquery/
# 在 cn.bing.com 上添加 hook
cn.bing.com hook-server://hook
```

## packages/demos

本地测试用的例子

运行 `npm run demos`，配置好 `whistle` 。
打开 http://localhost:3000/hook-test 测试。
F12 打开控制台。输入 `search('testEval')` 搜索

> [!note]  
> SwitchyOmega 配置
> 具体见 [#2](https://github.com/zhifengle/js-hook/issues/2)

![chrome-localhost-test screenshot](screenshots/chrome-localhost-test.png 'chrome-localhost-test screenshot')

也可以利用的 Nginx 设置本地域名进行反向代理

```conf
# Nginx 配置
server {
    listen       80;
    server_name  m.com;
    location / {
      proxy_pass       http://localhost:3000;
    }
}
```

配置好 Nginx 后 http://m.com/hook-test 测试。

![chrome-test screenshot](screenshots/chrome-test.png 'chrome-test screenshot')
