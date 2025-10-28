// tslint:disable:no-console
import helper from '@codeceptjs/helper';

import Logger, { getLogLabel } from '../../../app/utils/logger';
import { deleteCitizenUser } from '../../wip/user-service';
import * as testStateHelper from '../testStateHelper';
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

class FailedTest extends helper {
  async _failed(test: any) {
    logger.trace('Failed test: ' + test.title, logLabel);
    testStateHelper.addTestRun(test.title);
    await deleteCitizenUser();
  }

  async _passed(test: any) {
    testStateHelper.addTestRun(test.title);
    testStateHelper.addTestPassed(test.title);
    await deleteCitizenUser();
  }
}

module.exports = FailedTest;
