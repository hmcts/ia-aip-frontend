const config = require('config');
import { bootstrap as ourBootStrap, failureCheck as ourTeardown, teardownAll as ourTeardownAll } from './test/functional/bootstrap';

exports.config = {
  name: 'codecept',
  output: './functional-output/functional/reports/',
  bootstrapAll: async () => {
    await ourBootStrap();
  },
  teardown: async () => {
    ourTeardown();
  },
  teardownAll: async () => {
    await ourTeardownAll();
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
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true
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
