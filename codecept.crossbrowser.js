const config = require('config')

exports.config = {
  name: 'Codecept-crossbrowser',
  output: './functional-output/crossbrowser/reports/',
  helpers: {
    WebDriver: {
      url: process.env.TEST_URL || config.get('testUrl'),
      browser: "internet explorer",
      timeouts: {
        "script": 60000,
        "page load": 10000
      },
      desiredCapabilities: {}
    }
  },
  multiple: {
    basic: {
      browsers: [
        {
          browser: 'chrome',
          version: 'latest'
        },
        {
          browser: 'internet explorer',
          version: 'latest'
        },
      ]
    }
  },
  bootstrapAll: './test/functional/bootstrap-all.ts',
  teardownAll: './test/functional/bootstrap-all.ts',
  gherkin: {
    features: './test/e2e-test/features/*.feature',
    steps: ['./test/e2e-test/step_definitions/steps.ts']
  },
  plugins: {
    wdio: {
      enabled: true,
      services: ['sauce'],
      user: 'lewis.williams',
      key: config.get('saucelabs.secret'),
      region: 'eu',
      sauceConnect: false,
      sauceConnectOpts: {
        x: 'https://eu-central-1.saucelabs.com/rest/v1',
        verbose: true,
      },
      doctor: true,
    },
    stepByStepReport: {
      enabled: true,
      deleteSuccessful: false,
      fullPageScreenshots: true
    }
  },
  require: ['ts-node/register/transpile-only']
};

