function isUserAuthenticated(req, res, next) {
  res.locals.authenticated = !!(req.cookies && req.cookies['__auth-token']);
  next();
}

export {
  isUserAuthenticated
};
