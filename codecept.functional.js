const config = require('config')

exports.config = {
  name: 'codecept',
  output: './functional-output',
  bootstrap: './test/functional/bootstrap.ts',
  teardown: './test/functional/bootstrap.ts',
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      "chrome": {
        "ignoreHTTPSErrors": true
      }
    }
  },
  gherkin: {
    features: './test/functional/features/person-details-name-page.feature',
    steps: ['./test/e2e-test/step_definitions/steps.ts']
  },
  plugins: {
    stepByStepReport: {
      enabled: true
    }
  },
  require: ['ts-node/register/transpile-only']
};
