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
  require: ['ts-node/register/transpile-only']
};
