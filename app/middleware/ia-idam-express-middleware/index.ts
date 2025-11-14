import idamExpressAuthenticate from './services/idamExpressAuthenticate';
import idamExpressLanding from './services/idamExpressLanding';
import idamExpressLogout from './services/idamExpressLogout';
import idamExpressProtect from './services/idamExpressProtect';
import idamUserDetails from './services/idamUserDetails';

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

const idamExpressMiddleware = { authenticate, landingPage, protect, logout, userDetails };
export default idamExpressMiddleware;
