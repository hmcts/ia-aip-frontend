const config = require('config');
const process = require("process");
const browsers = require('./browsers.js');

const getBrowserConfig = browserGroup => {
  const browserConfig = [];

  const browsersToTest = browsers[browserGroup];
  const environment = process.env.NODE_ENV;

  const environmentTag = environment || 'LOCAL';

  browsersToTest.forEach(browser => {
      browser.name = '[' + environmentTag + '] - ' + browser.name;
      browser.tags = [ 'IA - AIP' ];
      browser.screenResolution = '1024x768';

      browserConfig.push({
        browser: browser.browserName,
        desiredCapabilities: browser
      });
    }
  );
  return browserConfig;
};

exports.config = {
  name: 'codecept',
  output: './functional-output/crossbrowser/reports/',
  //teardown: './test/functional/bootstrap.ts',
  teardown: async () => {
     process.exit();
  },
  helpers: {
    SauceLabsReportingHelper: {
      require: './test/crossbrowser/helpers/SauceLabsReportingHelper.js'
    },
    customHelper: {
      require: './test/e2e-test/helpers/navigationHelper.ts', // Import the custom helper file
    },
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      chrome: {
        ignoreHTTPSErrors: true
      },
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      user: process.env.SAUCE_USERNAME,
      key: process.env.SAUCE_ACCESS_KEY
    }
  },
  multiple: {
    microsoftIE11: {
      grep: '@crossbrowser',
      browsers: getBrowserConfig('microsoftIE11')
    },
    microsoftEdge: {
      grep: '@crossbrowser',
      browsers: getBrowserConfig('microsoftEdge')
    },
    chrome: {
      grep: '@crossbrowser',
      browsers: getBrowserConfig('chrome')
    },
    firefox: {
      grep: '@crossbrowser',
      browsers: getBrowserConfig('firefox')
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
      deleteSuccessful: false
    },
    selenoid: {
      enabled: false,
      deletePassed: true,
      autoCreate: true,
      autoStart: true,
      sessionTimeout: '30m',
      enableVideo: true,
      enableLog: true,
    },
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
