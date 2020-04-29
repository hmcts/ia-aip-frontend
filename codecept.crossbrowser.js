const config = require('config')

const SAUCE_USERNAME = 'lewis.williams';
const SAUCE_ACCESS_KEY = config.get('saucelabs.secret');
const TEST_URL = config.get('testUrl');

exports.config = {
  name: 'Codecept-crossbrowser',
  output: './functional-output/crossbrowser/reports/',
  helpers: {
    WebDriver: {
      url: TEST_URL,
      browser: 'chrome',
      services: [ 'sauce' ],
      user: SAUCE_USERNAME,
      key: SAUCE_ACCESS_KEY,
      sauceConnect: true,
      region: 'eu',
      restart: true,
      smartWait: 5000,
    }
  },
  multiple: {
    smoke: {
      grep: "@smokeCrossbrowser",
      // store results into `output/smoke` directory
      outputName: "smoke",
      browsers: [
        { browser: 'chrome', windowSize: 'maximize', version: 'latest' },
        { browser: 'firefox', windowSize: 'maximize', version: 'latest' },
        { browser: 'safari', windowSize: 'maximize', version: 'latest' },
        { browser: 'edge', windowSize: 'maximize', version: 'latest' },
        { browser: 'internet explorer', windowSize: 'maximize', version: '11' }
      ],
    }
  },
  bootstrapAll: './test/functional/bootstrap-all.ts',
  teardownAll: './test/functional/bootstrap-all.ts',
  gherkin: {
    features: './test/e2e-test/features/*.feature',
    steps: [ './test/e2e-test/step_definitions/steps.ts' ]
  },
  plugins: {
    stepByStepReport: {
      enabled: true,
      fullPageScreenshots: true,
      deleteSuccessful: false
    }
  },
  require: [ 'ts-node/register/transpile-only' ]
};

