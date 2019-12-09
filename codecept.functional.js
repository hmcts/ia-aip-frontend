const config = require('config')

exports.config = {
  name: 'codecept',
  tests: './*_test.js',
  output: './output',
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: config.get('showTests'),
      "chrome": {
        "ignoreHTTPSErrors": true
      }
      //,
      // "desiredCapabilities": {
      //   "proxy": {
      //     "proxyType": "manual",
      //     "httpProxy": "http://proxyout.reform.hmcts.net:8080",
      //     "sslProxy": "http://proxyout.reform.hmcts.net:8080"
      //   }
    }
  },
  include: {
    I: './steps_file.js'
  },
  gherkin: {
    features: './test/e2e-test/features/*.feature',
    steps: ['./test/e2e-test/step_definitions/steps.js']
  },
  plugins: {
    "stepByStepReport": {
      "enabled": true
    }
  }
};
