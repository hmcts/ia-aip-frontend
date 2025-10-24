// tslint:disable:no-console
import helper from '@codeceptjs/helper';
import * as testStateHelper from '../testStateHelper';

class FailedTest extends helper {
  _failed(test: any) {
    console.log('Failed test: ' + test.title);
    testStateHelper.addTestTitle(test.title);
    testStateHelper.setTestFailed(true);
  }

  _passed(test: any) {
    testStateHelper.addTestTitle(test.title);
    testStateHelper.incrementTestsPassed();
  }
}

module.exports = FailedTest;
