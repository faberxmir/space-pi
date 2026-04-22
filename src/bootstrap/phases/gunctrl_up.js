const { createGunctrlService } = require('../../services/gunctrl');

async function gunctrl_up(context) {
  const gunctrlService = createGunctrlService({
    ledService:    context.ledService,
    buzzerService: context.buzzerService,
    logger:        context.logger,
  });

  context.terminalService.registerInternal('gunctrl', args => gunctrlService.handle(args));

  context.logger?.info?.('[GUNCTRL_UP] gun control ready');
  return context;
}

module.exports = { gunctrl_up };
