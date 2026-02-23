const {createHttpServer} = require("../../http/server");
const {createApp} = require("../../http/app");

async function routesUp(context) {
   let app = createApp(context);
    context.httpServer = createHttpServer(app, context.logger);

}

module.exports = { routesUp };