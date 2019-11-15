const dyson = require('dyson');
const path = require('path');

module.exports = () => {
  const dysonOptions = {
    configDir: path.resolve(__dirname, './services/'),
    port: 20001
  };
  const configs = dyson.getConfigurations(dysonOptions);
  const appBefore = dyson.createServer(dysonOptions);
  dyson.registerServices(appBefore, dysonOptions, configs);
};
