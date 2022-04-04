function isUserAuthenticated(req, res, next) {
  res.locals.authenticated = !!(req.cookies && req.cookies['__auth-token'] && req.cookies['_oauth2_proxy']);
  next();
}

export {
  isUserAuthenticated
};
