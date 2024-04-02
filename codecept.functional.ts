import config from 'config';
import { bootstrap as ourBootStrap, teardown as ourTeardown } from './test/functional/bootstrap';

exports.config = {
  name: 'codecept',
  output: './functional-output/functional/reports/',
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
