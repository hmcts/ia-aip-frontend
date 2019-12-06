const config = require('config')

exports.config = {
  name: 'Codecept-crossbrowser',
  tests: './*_test.js',
  helpers: {
    WebDriver: {
      url: 'https://localhost:3000',
      browser: "firefox",
        waitForTimeout: 1500000,
        smartWait: 150000,
      desiredCapabilities: {
        'moz:firefoxOptions': {
          accept_insecure_certs: true,
          httpProxyAll: true,
          proxyDNSOptional: true,
          proxyTypeOptional: 'autoConfig'
        }
      // desiredCapabilities: {
      //   ieOptions: {
      //     "ie.browserCommandLineSwitches": "-private",
      //     "ie.usePerProcessProxy": true,
      //     "ie.ensureCleanSession": true,
      //     "acceptInsecureCerts": true
      //   }
      },
    }
  },
    include: {
      I: './steps_file.js',
      signInPOM: './test/e2e-test/Page.js',

    },
    gherkin: {
      features: './test/e2e-test/features/*.feature',
      steps: ['./test/e2e-test/step_definitions/steps.js']
    },
    plugins: {
      wdio: {
        url: 'https://localhost:3000',
        enabled: true,
        services: ['sauce'],
        user: 'lewis.williams',
        key: 'b4622cca-704b-4ae6-a6c2-b12e93d522d7',
        region: 'eu',
        sauceConnect: true,
        sauceConnectOpts: {
          x: 'https://eu-central-1.saucelabs.com/rest/v1'
        },
        doctor: true
      }
    },
  };

