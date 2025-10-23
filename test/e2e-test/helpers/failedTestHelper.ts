// tslint:disable:no-console
import helper from '@codeceptjs/helper';
import { deleteUsers } from '../../wip/user-service';
import * as testStateHelper from '../testStateHelper';

class FailedTest extends helper {
  async _failed(test: any) {
    console.log('Failed test: ' + test.title);
    testStateHelper.addTestTitle(test.title);
    testStateHelper.setTestFailed(true);
    await deleteUsers();
  }

  async _passed(test: any) {
    testStateHelper.addTestTitle(test.title);
    testStateHelper.incrementTestsPassed();
    await deleteUsers();
  }
}

module.exports = FailedTest;
