export default (
  server: Whistle.PluginServer,
  options: Whistle.PluginOptions
) => {
  // const app = new Koa();
  // app.use(async (ctx) => {
  //   const { req, res } = ctx;
  //   console.log('------------------------')
  //   console.log(res);

  //   res.end('hello');
  // });
  // server.on('request', app.callback());
  server.on(
    'request',
    (req: Whistle.PluginRequest, res: Whistle.PluginResponse) => {
      const { ruleValue } = req.originalReq;
      if (!ruleValue.startsWith('hook-js')) {
        res.end(
          `/.*/ jsPrepend://${require.resolve(
            '@js-hook/core/dist/browser'
          )} includeFilter://resH:Content-Type=text/html`
        );
      } else {
        res.end();
      }
    }
  );
};
