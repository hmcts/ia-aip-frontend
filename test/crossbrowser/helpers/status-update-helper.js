const event = require('codeceptjs').event;
const container = require('codeceptjs').container;
const exec = require('child_process').exec;

function updateResult(result, sessionId, config) {
  let username = config.user;
  let credentials = username;
  credentials = credentials.concat(":");
  credentials = credentials.concat(config.key);
  
  // tslint:disable:no-console
  console.log('SauceOnDemandSessionID=' + sessionId + ' job-name=ia-aip-frontend');
  return 'curl -X PUT -s -d \'{"passed": ' + result + '}\' -u ' + credentials + ' https://eu-central-1.saucelabs.com/rest/v1/' + username + '/jobs/' + sessionId;
}

module.exports = function () {

  /**
   * Updates the saucelabs test result to 'passed'
   */
  event.dispatcher.on(event.test.passed, () => {
    const webDriverHelper = container.helpers('WebDriver');
    const sessionId = webDriverHelper.browser.requestHandler.sessionID;
    const config = webDriverHelper.config;
    exec(updateResult('true', sessionId, config));
  });


  /**
   * Updates the saucelabs test result to 'failed'
   */
  event.dispatcher.on(event.test.failed, () => {
    const webDriverHelper = container.helpers('WebDriver');
    const sessionId = webDriverHelper.browser.requestHandler.sessionID;
    const config = webDriverHelper.config;
    exec(updateResult('false', sessionId, config));
  });
};
