const path = require('path');
const express = require('express');
const { createBuzzerRoutes }  = require('./routes/buzzer_routes');
const { createLedRoutes }     = require('./routes/led_routes');
const { createOledRoutes }    = require('./routes/oled_routes');
const { createPageRoutes }    = require('./routes/page_routes');
const { createTerminalRoutes} = require('./routes/terminal_routes');
const { createAuthRoutes }    = require('./routes/auth_routes');

function createApp(context) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../../views'));
  app.use(express.static(path.join(__dirname, '../../public')));
  app.use('/cockpit', express.static(path.join(__dirname, '../../cockpit')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(createAuthRoutes({
    sessionService: context.sessionService,
    oledService:    context.oledService,
    logger:         context.logger,
  }));

  // Pass context by reference so handlers can access cockpitService after cockpit_up runs
  app.use('/', createPageRoutes(context));
  app.use('/buzzer',   createBuzzerRoutes({ buzzerService: context.buzzerService, logger: context.logger }));
  app.use('/led',      createLedRoutes({ ledService: context.ledService, logger: context.logger }));
  app.use('/oled',     createOledRoutes({ oledService: context.oledService, logger: context.logger }));
  app.use('/terminal', createTerminalRoutes({ terminalService: context.terminalService, sessionService: context.sessionService, logger: context.logger }));

  return app;
}

module.exports = { createApp };
