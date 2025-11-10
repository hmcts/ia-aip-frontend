const { expect } = require('chai');
const sinon = require('sinon');
const cookies = require('./cookies');

describe('cookies', () => {
  let req = null;
  let res = null;

  beforeEach(() => {
    req = {
      cookies: {},
      query: []
    };
    res = {
      cookie: sinon.stub(),
      clearCookie: sinon.stub()
    };
  });

  describe('#set', () => {
    it('sets cookie in response', () => {
      // Arrange.
      const cookieName = 'name';
      const cookieValue = 'value';
      // Act.
      cookies.set(res, cookieName, cookieValue);
      // Assert.
      expect(res.cookie.calledOnce).to.equal(true);
      expect(res.cookie.calledWith(cookieName, cookieValue)).to.equal(true);
    });
  });

  describe('#get', () => {
    it('gets cookie in response', () => {
      // Arrange.
      const cookieName = 'someCookie';
      req.cookies[cookieName] = 'some-value';
      // Act.
      const output = cookies.get(req, cookieName);
      // Assert.
      expect(output).to.equal(req.cookies[cookieName]);
    });

    it('returns undefined when cookie not found', () => {
      // Arrange.
      const cookieName = 'someCookie';
      req.cookies[cookieName] = 'some-value';
      // Act.
      const output = cookies.get(req, 'nonexistent-cookie');
      // Assert.
      expect(output).to.equal(undefined); // eslint-disable-line no-undefined
    });

    it('returns undefined when no cookies set', () => {
      // Arrange.
      delete req.cookies;
      // Act.
      const output = cookies.get(req, 'nonexistent-cookie');
      // Assert.
      expect(output).to.equal(undefined); // eslint-disable-line no-undefined
    });
  });

  describe('#remove', () => {
    it('removes cookie in response', () => {
      // Arrange.
      const cookieName = 'name';
      // Act.
      cookies.remove(res, cookieName);
      // Assert.
      expect(res.clearCookie.calledOnce).to.equal(true);
      expect(res.clearCookie.calledWith(cookieName)).to.equal(true);
    });
  });
});
