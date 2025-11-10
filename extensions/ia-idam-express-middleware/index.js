const idamExpressAuthenticate = require('./services/idamExpressAuthenticate');
const idamExpressLanding = require('./services/idamExpressLanding');
const idamExpressProtect = require('./services/idamExpressProtect');
const idamExpressLogout = require('./services/idamExpressLogout');
const idamUserDetails = require('./services/idamUserDetails');

const authenticate = (args = {}) => {
  return idamExpressAuthenticate(args);
};

const landingPage = (args = {}) => {
  return idamExpressLanding(args);
};

const protect = (args = {}) => {
  return idamExpressProtect(args);
};

const logout = (args = {}) => {
  return idamExpressLogout(args);
};

const userDetails = (args = {}) => {
  return idamUserDetails(args);
};

module.exports = { authenticate, landingPage, protect, logout, userDetails };
