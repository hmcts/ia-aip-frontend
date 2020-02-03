module.exports = {
  path: '/login',
  method: 'GET',
  render: (req, res) => {
    res.append('Content-Type', 'text/html');
    // use the redirect url in request for the final redirect
    const redirectUri = req.query.redirect_uri;
    const stateParam = req.query.state ? req.query.state : '';
    res.send(`<html><head>
      <title>Sign in - HMCTS Access</title>
      </head><body>
      <h1>Sign in - HMCTS Access</h1>
      <form action="/login" method="post">
      Username: <input type="text" id="username" name="username"/><br />
      Password: <input type="text" id="password" name="password"/><br />
      <input type="text" name="redirect_uri" value="${redirectUri}"/>
      <input type="text" name="state" value="${stateParam}"/>
      <input id="login" class="button" type="submit" name="save" value="Sign in"/>
      </form>
      </body></html>`);
  }
};
