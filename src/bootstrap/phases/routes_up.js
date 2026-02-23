// src/bootstrap/phases/routes_up.js
const {createHttpServer} = require("../../http/server");
const {createApp} = require("../../http/app");

async function routesUp(context) {
   let app = createApp(context);
    context.httpServer = createHttpServer(app, context.logger);
    context.httpServer.start();
    context.oled.phase("ROUTES_UP");

    context.lifecycle.register("httpServer", context.httpServer.stop);
}

module.exports = { routesUp };