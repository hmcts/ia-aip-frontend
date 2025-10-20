const Helper = require('@codeceptjs/helper');
const { deleteUsers } = require("../../functional/user-service");

class FailedTest extends Helper {
  async _failed(test) {
    console.log('Failed test: ' + test.title);
    global.testFailed = true;
    if (!global.testsTitles.includes(test.title)) {
      global.testsTitles.push(test.title);
    }
    await deleteUsers();
  }

  async _passed(test) {
    global.testsPassed += 1;
    if (!global.testsTitles.includes(test.title)) {
      global.testsTitles.push(test.title);
    }
    await deleteUsers();
  }
}

module.exports = FailedTest;
