function isUserAuthenticated(req, res, next) {
  // tslint:disable-next-line:no-console
  console.info('isUserAuthenticated: ', req.cookies['__auth-token']);
  res.locals.authenticated = !!(req.cookies && req.cookies['__auth-token']);
  next();
}

export {
  isUserAuthenticated
};
