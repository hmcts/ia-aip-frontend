// tslint:disable:no-console
import helper from '@codeceptjs/helper';
import TestState from '../TestState.json';
import * as testStateHelper from '../testStateHelper';

class FailedTest extends helper {
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
