const { expect } = require('chai');
const getServiceAuth = require('./getServiceAuth');

describe('getServiceAuth', () => {
  it('should return a properly encoded base64 string with a client id and secret', () => {
    const args = {
      idamClientID: 'clientId',
      idamSecret: 'secret'
    };

    const base64String = Buffer.from(`${args.idamClientID}:${args.idamSecret}`).toString('base64');

    expect(getServiceAuth(args)).to.equal(base64String);
  });

  it('should throw an error when no client id and secret exists', () => {
    const args = {};

    expect(() => {
      getServiceAuth(args);
    }).to.throw('ClientID or Secret is undefined');
  });

  it('should throw an error when no client id exists', () => {
    const args = { idamSecret: 'secret' };

    expect(() => {
      getServiceAuth(args);
    }).to.throw('ClientID or Secret is undefined');
  });

  it('should throw an error when no secret exists', () => {
    const args = { idamClientID: 'clientId' };

    expect(() => {
      getServiceAuth(args);
    }).to.throw('ClientID or Secret is undefined');
  });
});