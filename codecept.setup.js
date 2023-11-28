const config = require('config')

exports.config = {
  name: 'codecept',
  output: './functional-output/e2e/reports/',
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      chrome: {
        ignoreHTTPSErrors: true
      }
    },
    customHelper: {
      require: './test/e2e-test/helpers/navigationHelper.ts', // Import the custom helper file
    },
  },
  gherkin: {
    features: './test/e2e-test/setup/reasons_for_appeal_requested.feature',
    steps: ['./test/e2e-test/step_definitions/steps.ts']
  },
  plugins: {
    retryFailedStep: {
       enabled: true
    },
    stepByStepReport: {
      enabled: true,
      fullPageScreenshots: true,
      deleteSuccessful: false
    }
  },
  require: ['ts-node/register/transpile-only']

};
