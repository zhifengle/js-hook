# js-hook

解析 JavaScript 的 AST，添加自定义的钩子。

逻辑和思路参考 [CC11001100/ast-hook-for-js-RE: 浏览器内存漫游解决方案（探索中...）](https://github.com/CC11001100/ast-hook-for-js-RE)

出于学习的目的，用 TypeScript 按照自己的理解重写了一遍。

主要改动

- 使用 [avwo/whistle](https://github.com/avwo/whistle) 作为拦截代理
  1. [alibaba/anyproxy](https://github.com/alibaba/anyproxy) 好像没人维护了
  2. whistle 的规则功能比较灵活，可以按需配置要处理的 JS 的文件。比如不需要处理 jquery 文件，就设置规则排除。规则参考看下文。
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

> [!IMPORTANT]  
> 然后打开 http://127.0.0.1:8899/#rules 配置好 hook-server 规则。才能正常使用

具体设置，参考下面的 [whistle 的规则参考](#whistle 的规则参考)

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

### whistle 的规则参考

```conf
# Chrome 不支持 localhost 原因未知
# localhost hook-server://hook excludeFilter:///jquery/
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

用来本地测试的。运作 `npm run demos`，配置好 `whistle` 。
打开 http://m.com:3000/hook-test 测试。

> 不知道为何 Chrome 配置 SwitchyOmega。无法代理 localhost。
> 利用的 Nginx 设置本地域名进行反向代理

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

![chrome-test screenshot](screenshots/chrome-test.png 'chrome-test screenshot')
