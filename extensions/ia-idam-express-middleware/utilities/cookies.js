const set = (res, cookieName, cookieValue,
  domain = process.env.PUBLIC_HOSTNAME) => {
  res.cookie(cookieName, cookieValue, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    domain
  });
};

const get = (req, cookieName) => {
  if (req.cookies) {
    return req.cookies[cookieName];
  }
  return undefined; // eslint-disable-line no-undefined
};

const remove = (res, cookieName) => {
  return res.clearCookie(cookieName);
};

module.exports = { set, get, remove };
