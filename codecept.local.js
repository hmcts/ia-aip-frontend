exports.config = {
  name: 'codecept',
  tests: './*_test.js',
  output: './output',
  helpers: {
    TestCafe: {
      url: 'https://localhost:3000',
      browser: "chrome",
      show: true
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
    },
  };


