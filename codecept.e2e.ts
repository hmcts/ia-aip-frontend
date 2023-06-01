import config from 'config';
import { bootstrap as ourBootStrap, teardown as ourTeardown } from './test/functional/bootstrap';

exports.config = {
  name: 'codecept',
  output: './functional-output/e2e/reports/',
  bootstrap: async () => {
    await ourBootStrap();
  },
  teardown: async () => {
    await ourTeardown();
  },
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
    features: './test/e2e-test/features/*.feature',
    steps: ['./test/e2e-test/step_definitions/steps.ts']
  },
  plugins: {
    retryFailedStep: {
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
