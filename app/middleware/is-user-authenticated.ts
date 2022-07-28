import { paths } from '../paths';

const redirectToPaths = [
  paths.makeApplication.judgesReview
];

function isUserAuthenticated(req, res, next) {
  res.locals.authenticated = !!(req.cookies && req.cookies['__auth-token']);
  if (!res.locals.authenticated && redirectToPaths.includes(req.originalUrl)) {
    req.session.redirectUrl = req.originalUrl;
  }
  next();
}

export {
  isUserAuthenticated
};
