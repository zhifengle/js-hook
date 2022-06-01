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
      res.end(
        `/.*/ jsPrepend://${require.resolve(
          'js-hook/dist/browser'
        )} includeFilter://resH:Content-Type=text/html`
      );
    }
  );
};
