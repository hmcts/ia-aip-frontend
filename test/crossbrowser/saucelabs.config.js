const browsers = require('./browsers.js');
const config = require('config');
const ourBootstrap = {bootstrapAll} =  require('../functional/bootstrap-all.ts').bootstrapAll;
const ourTeardown = {teardownAll} =  require('../functional/bootstrap-all.ts').teardownAll;

const SAUCE_USERNAME = process.env.SAUCE_USERNAME;
const SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY;
const TEST_URL = config.get('testUrl');

/**
 * Retrieves supported browser capabilities and configuration defined in crossbrowser/browsers.js
 * @param browserGroup the browser group e.g 'chrome' as defined in browsers.js
 * @return a list of browser configurations to be run.
 */
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
  name: 'AIP Frontend Tests',
  helpers: {
    WebDriver: {
      url: TEST_URL,
      browser: 'chrome',
      waitForTimeout: 60000,
      cssSelectorsEnabled: 'true',
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      user: SAUCE_USERNAME,
      key: SAUCE_ACCESS_KEY,
      desiredCapabilities: {},
    },
    SauceLabsReportingHelper: {
      require: './helpers/SauceLabsReportingHelper.js'
    }
    // StatusUpdateHelper: {
    //   require: "./helpers/status-update-helper"
    // }
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
    // safari: {
    //   browsers: getBrowserConfig('safari')
    // }
  },
  bootstrapAll: bootstrapAll,
  teardownAll: teardownAll,
  gherkin: {
    features: '../e2e-test/features/*.feature',
    steps: [ '../e2e-test/step_definitions/steps.ts' ]
  },
  plugins: {
    stepByStepReport: {
      enabled: true,
      fullPageScreenshots: true,
      deleteSuccessful: false,
      output: "functional-output/crossbrowser/reports/"
    },
    selenoid: {
      enabled: true,
      deletePassed: true,
      autoCreate: true,
      autoStart: true,
      sessionTimeout: '30m',
      enableVideo: true,
      enableLog: true,
    },
  },
  require: [ 'ts-node/register/transpile-only' ]
};
