function isUserAuthenticated(req, res, next) {
  res.locals.authenticated = !!(req.cookies && req.cookies['__auth-token']);
  // tslint:disable-next-line:no-console
  console.debug('isUserAuthenticated: ', res.locals.authenticated);
  next();
}

export {
  isUserAuthenticated
};
