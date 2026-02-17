// tslint:disable:no-console
import helper from '@codeceptjs/helper';

const workerThreads = require('node:worker_threads');

class FunctionalStepHelper extends helper {
  async _beforeStep(step: any) {
    step.actor = `[0${workerThreads.threadId}] ${step.actor}`;
  }
}

module.exports = FunctionalStepHelper;
