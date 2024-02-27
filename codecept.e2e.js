const config = require('config');
const process = require("process");

exports.config = {
  name: 'codecept',
  timeout: 600,
  output: './functional-output/e2e/reports/',
  bootstrap: async() => {
    global.testsPassed = 0;
    global.testsTitles = [];
    global.testFailed = false;
  },
  teardown: async() => {
    if (global.testFailed) {
      console.log('---------------------');
      console.log('Total scenarios run: ' + global.testsTitles.length);
      console.log('Scenarios passed: ' + global.testsPassed);
      console.log('---------------------');
      if (global.testsPassed === global.testsTitles.length) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    } else {
      process.exit(0);
    }
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
      require: './test/e2e-test/helpers/navigationHelper.ts', // Import the custom helper file
    },
    FailedTest: {
      require: './test/e2e-test/helpers/failedTestHelper.js',
    },
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
      fullPageScreenshots: false,
      deleteSuccessful: true,
    },
    retryTo: {
      enabled: true
    }
  },
    "mocha": {
        "reporterOptions": {
            "codeceptjs-cli-reporter": {
                "stdout": "-",
                "options": {
                    "verbose": true,
                    "steps": true,
                }
            },
           "mochawesome": {
                "stdout": "./functional-output/e2e/reports/console.log",
                "options": {
                    "reportDir": "./functional-output/e2e/reports/",
                    "reportFilename": "report"
                }
            }
        }
    },
  require: ['ts-node/register/transpile-only']
};
