const jwt = require('jsonwebtoken');

const token = jwt.sign({
  forename: 'John',
  surname: 'Smith'
}, 'secret', { expiresIn: '1h' });


module.exports = {
  path: '/oauth2/token',
  method: 'POST',
  template: {
    access_token: token
  }
};