const Helper = require('@codeceptjs/helper');

class FailedTest extends Helper {
  _failed(test) {
    global.testFailed = true;
    if (!global.testsTitles.includes(test.title)) {
      global.testsTitles.push(test.title);
    }
  }

  _passed(test) {
    global.testsPassed += 1;
    if (!global.testsTitles.includes(test.title)) {
      global.testsTitles.push(test.title);
    }
  }
}

module.exports = FailedTest;
