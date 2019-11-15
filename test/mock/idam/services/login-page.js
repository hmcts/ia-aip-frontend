module.exports = {
  path: '/login',
  method: 'GET',
  render: (req, res) => {
    res.append('Content-Type', 'text/html');
    // use the redirect url in request for the final redirect
    const redirectUri = req.query.redirect_uri;
    const stateParam = req.query.state ? req.query.state : '';
    res.send(`<html><head></head><body>
      <form action="/login" method="post">
      Username: <input type="text" id="username" name="username"/><br />
      Password: <input type="text" id="password" name="password"/><br />
      <input type="text" name="redirect_uri" value="${redirectUri}"/>
      <input type="text" name="state" value="${stateParam}"/>
      <input type="submit" name="save" value="login"/>
      </form>
      </body></html>`);
  }
};
