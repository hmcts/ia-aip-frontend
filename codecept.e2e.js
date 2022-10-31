const config = require('config')

exports.config = {
  name: 'codecept',
  output: './functional-output/e2e/reports/',
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: true,
      windowSize: '1280x960',
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
      fullPageScreenshots: true,
      deleteSuccessful: true
    }
  },
  require: ['ts-node/register/transpile-only']
};
