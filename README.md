# js-hook

解析 JavaScript 的 AST，添加自定义的钩子。

逻辑和思路都是照搬的 [CC11001100/ast-hook-for-js-RE: 浏览器内存漫游解决方案（探索中...）](https://github.com/CC11001100/ast-hook-for-js-RE)

出于学习的目的，用 TypeScript 按照自己的理解重写了一遍。

主要改动

- 使用 [avwo/whistle](https://github.com/avwo/whistle) 作为拦截代理
  1. anyproxy 好像没人维护了
  2. whistle 的规则功能比较灵活，可以按需配置要处理的 JS 的文件。比如不需要处理 jquery 文件，就设置规则排除。规则参考看下文。
- 调整的资源的缓存方式，资源缓存在用户目录下面的 `.cache/js-hook-cache`。按照域名和资源路径保存。
- 尝试使用 pnpm 管理工作空间，初衷是想抄一下 `vuejs/core` 的设置，发现比较麻烦，最终还是自己设置。有待改进。

TODO

- [ ] 针对 `eval expressions` 的处理。
  - 这里指的是 eval Function, setTimeout, setInterval
  - 参考链接: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_eval_expressions
- [ ] 优化速度，使用 Rust 版本的 babel: `swc`。直接使用 `@swc/core` 或者用 Rust 实现
  - 可能会鸽。
- [ ] 保存 hook 数据的历史记录，对比前后两次的调用。

## 使用

安装 [avwo/whistle](https://github.com/avwo/whistle)

项目使用 [pnpm](https://pnpm.io/) 管理依赖。 [安装文档](https://pnpm.io/installation)

```bash
pnpm install
# 构建项目，然后将本项目里面的 whistle.hook-server 插件 link 到全局的依赖。方便 whistle 读取
pnpm run start
```

## packages/whistle.hook-server

目前内置了三种规则 `hook` `hook-js` `hook-no-cache`。

- `hook`: 解析修改 JavaScript 文件。在 HTML 文件的头部插入运行依赖.
- `hook-js`: 解析修改 JavaScript 文件。并在改 JS 文件头部插入运行依赖
- `hook-no-cache`: 同 `hook`，只是没有缓存解析后的 JS 文件。

## whistle 的规则参考

```conf
# 使用正则排除链接里面包含 jquery 的文件
localhost hook-server://hook excludeFilter:///jquery/

# 统计脚本返回 404；
https://hm.baidu.com statusCode://404
# 返回 404；这些都是反调试的脚本
/match.yuanrenxue.com\/static\/match\/safety\/.*.js/ statusCode://404
match.yuanrenxue.com hook-server://hook-js excludeFilter:///jquery/
```

## packages/demos

用来本地测试的。运作 `npm run demos`，配置好 `whistle` 。打开 http://localhost:3000/hook-test 测试。

> 不知道为何 Chrome 配置 SwitchyOmega。无法代理 localhost。理论上可以改成自己的 IP 测试

![firefox-test screenshot](screenshots/firefox-test.png 'firefox-test screenshot')
