import config from 'config';
import * as testStateHelper from './test/e2e-test/testStateHelper';
import { failureCheck } from './test/functional/bootstrap';

exports.config = {
  name: 'codecept',
  timeout: 600,
  output: './functional-output/e2e/reports/',
  bootstrap: async () => {
    testStateHelper.resetTestState();
  },
  teardown: async () => {
    failureCheck();
  },
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      chrome: {
        ignoreHTTPSErrors: true
      },
      restart: true
    },
    customHelper: {
      require: './test/e2e-test/helpers/navigationHelper.ts'
    },
    FailedTest: {
      require: './test/e2e-test/helpers/failedTestHelper.ts'
    }
  },
  gherkin: {
    features: './test/e2e-test/features/*.feature',
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
      },
      'mochawesome': {
        'stdout': './functional-output/e2e/reports/console.log',
        'options': {
          'reportDir': './functional-output/e2e/reports/',
          'reportFilename': 'report'
        }
      }
    }
  },
  require: ['ts-node/register/transpile-only']
};
