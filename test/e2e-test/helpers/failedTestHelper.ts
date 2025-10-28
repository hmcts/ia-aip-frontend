// tslint:disable:no-console
import helper from '@codeceptjs/helper';

import Logger, { getLogLabel } from '../../../app/utils/logger';
import { deleteCitizenUser } from '../service/user-service';
import * as testStateHelper from '../testStateHelper';
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

class FailedTest extends helper {
  async _failed(test: any) {
    logger.traceWorker('Failed test: ' + test.title, logLabel);
    testStateHelper.addTestRun(test.title);
    await deleteCitizenUser();
  }

  async _passed(test: any) {
    testStateHelper.addTestRun(test.title);
    testStateHelper.addTestPassed(test.title);
    await deleteCitizenUser();
  }

  async _before(test: any) {
    logger.traceWorker('Starting test: ' + test.title, logLabel);
  }
}

module.exports = FailedTest;
