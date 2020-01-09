const config = require('config')

exports.config = {
  name: 'codecept',
  output: './functional-output',
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
    features: './test/e2e-test/features/*.feature',
    steps: ['./test/e2e-test/step_definitions/steps.ts']
  },
  plugins: {
    stepByStepReport: {
      enabled: true,
      deleteSuccessful: false
    }
  },
  require: ['ts-node/register/transpile-only']
};
