const config = require('config');
const sauceConnectLauncher = require('sauce-connect-launcher');
let sauceConnectProcess;

// tslint:disable no-console
async function sauceConnect() {
  return new Promise(function (resolve, reject) {
    sauceConnectLauncher({
      username: 'lewis.williams',
      accessKey: config.get('saucelabs.secret'),
      verbose: true,
      // retry to establish a tunnel multiple times. (optional)
      connectRetries: 5,
      // time to wait between connection retries in ms. (optional)
      connectRetryTimeout: 2000,
      logger: function (message) {
        console.info(message);
      },
      x: 'https://eu-central-1.saucelabs.com/rest/v1'
    }, function (err, sauceConnectProcess) {
      if (err) {
        console.error(err);
        return reject(err);
      }
      console.info('Sauce connect ready');
      resolve(sauceConnectProcess);
    });
  });
}

module.exports = {
  bootstrapAll: async function(done) {
    sauceConnectProcess = await sauceConnect();
    done();
  },
  teardownAll: function(done) {
    if (sauceConnectProcess) {
      sauceConnectProcess.close(() => {
        console.info('Closed sauce connect process');
      });
    }
    done();
  }
};
