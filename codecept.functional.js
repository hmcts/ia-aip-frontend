const config = require('config');

exports.config = {
  name: 'codecept',
  output: './functional-output/functional/reports/',
  bootstrap: './test/functional/bootstrap.ts',
  teardown: './test/functional/bootstrap.ts',
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      chrome: {
        ignoreHTTPSErrors: true,
        args: ['--disable-web-security', "--user-data-dir=/tmp/crm"]
      }
    }
  },
  gherkin: {
    features: './test/functional/features/' + config.get('functionalTests'),
    steps: ['./test/e2e-test/step_definitions/steps.ts']
  },
  plugins: {
    retryFailedStep: {
       enabled: true
    },
    stepByStepReport: {
      enabled: true,
      fullPageScreenshots: true,
      deleteSuccessful: true
    }
  },
  require: ['ts-node/register/transpile-only']
};
