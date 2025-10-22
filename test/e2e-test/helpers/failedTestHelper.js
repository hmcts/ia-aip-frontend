const Helper = require('@codeceptjs/helper');
const testStateHelper = require('../testStateHelper');
const TestState = require('../TestState.json');

class FailedTest extends Helper {
  _failed(test) {
    console.log('Failed test: ' + test.title);
    testStateHelper.setTestFailed(true);
    if (!TestState.testsTitles.includes(test.title)) {
      testStateHelper.addTestTitle(test.title);
    }
  }

  _passed(test) {
    testStateHelper.incrementTestsPassed();
    if (!TestState.testsTitles.includes(test.title)) {
      testStateHelper.addTestTitle(test.title);
    }
  }
}

module.exports = FailedTest;
