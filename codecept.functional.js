const config = require('config')

exports.config = {
  name: 'codecept',
  tests: './*_test.js',
  output: './output',
  helpers: {
    Puppeteer: {
      url: config.get('testUrl'),
      show: false,
      "chrome": {
        "ignoreHTTPSErrors": true
      }
    }
    // TestCafe: {
    //   url: 'https://localhost:3000',
    //   browser: "chrome",
    //   show: false
    // }
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
