const config = require('config');
import { bootstrap as ourBootStrap, teardown as ourTeardown } from './test/functional/bootstrap';

exports.config = {
  name: 'codecept',
  output: './functional-output/functional/reports/',
  bootstrapAll: async () => {
    await ourBootStrap();
  },
  teardownAll: async () => {
    await ourTeardown();
  },
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      chrome: {
        ignoreHTTPSErrors: true
      }
    },
    FailedTest: {
      require: './test/e2e-test/helpers/failedTestHelper.ts'
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
    },
    retryTo: {
      enabled: true
    }
  },
  'mocha': {
    'reporterOptions': {
      'codeceptjs-cli-reporter': {
        'stdout': '-',
        'options': {
          'verbose': true,
          'steps': true
        }
      }
    }
  },
  require: ['ts-node/register/transpile-only']
};
