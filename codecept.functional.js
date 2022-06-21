const config = require('config');
const { bootstrap, teardown } = require('./test/functional/bootstrap.ts');

exports.config = {
  name: 'codecept',
  output: './functional-output/functional/reports/',
  bootstrap: bootstrap(),
  teardown: teardown(),
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      chrome: {
        ignoreHTTPSErrors: true
      }
    }
  },
  gherkin: {
    features: './test/functional/features/' + config.get('functionalTests'),
    steps: ['./test/e2e-test/step_definitions/steps.ts']
  },
  plugins: {
    stepByStepReport: {
      enabled: true,
      fullPageScreenshots: true,
      deleteSuccessful: true
    }
  },
  require: ['ts-node/register/transpile-only']
};
