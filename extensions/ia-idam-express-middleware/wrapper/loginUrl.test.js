const sinon = require('sinon');
const { expect } = require('chai');
const url = require('url');
const loginUrl = require('./loginUrl');

describe('loginUrl', () => {
  const args = {};

  beforeEach(() => {
    sinon.spy(url, 'format');
  });

  afterEach(() => {
    url.format.restore();
  });

  it('makes the request to obtain token', () => {
    // Arrange.
    const options = { foo: 'bar' };
    args.idamLoginUrl = 'some-url';
    args.idamClientID = 'some-id';
    args.redirectUri = 'some-uri';
    // Act.
    const output = loginUrl(options, args);
    // Assert.
    expect(url.format.calledOnce).to.equal(true);
    const formatArgs = url.format.getCall(0).args.pop();
    expect(formatArgs).to.have.property('query');
    expect(output).to.contain(Object.keys(options).pop());
  });
});
