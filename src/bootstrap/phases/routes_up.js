const { createHttpServer } = require('../../http/server');
const { createApp }        = require('../../http/app');

async function routesUp(context) {
  const app = createApp(context);
  context.httpServer = createHttpServer(app, context.logger);
  context.httpServer.start();
  context.lifecycle.register('httpServer', context.httpServer.stop);
  await context.oledService?.phase('ROUTES_UP');
}

module.exports = { routesUp };
