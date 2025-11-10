const sinon = require('sinon');
const { expect } = require('chai');
const request = require('request-promise-native');
const getUserDetails = require('./getUserDetails');

describe('getUserDetails', () => {
  const args = {};

  beforeEach(() => {
    sinon.stub(request, 'get');
  });

  afterEach(() => {
    request.get.restore();
  });

  it('makes the request to obtain oauth token', () => {
    // Arrange.
    const token = 'some-token';
    args.idamApiUrl = 'some-url';
    // Act.
    getUserDetails(token, args);
    // Assert.
    expect(request.get.calledOnce).to.equal(true);
    const requestOptions = request.get.getCall(0).args.pop();
    expect(requestOptions).to.have.property('json', true);
    expect(requestOptions.uri).to.equal(`${args.idamApiUrl}/details`);
    expect(requestOptions.headers.Authorization).to.contain(token);
  });

  it('makes the request to obtain openId token', () => {
    // Arrange.
    const token = 'some-token';
    args.idamApiUrl = 'some-url';
    args.openId = true;
    // Act.
    getUserDetails(token, args);
    // Assert.
    expect(request.get.calledOnce).to.equal(true);
    const requestOptions = request.get.getCall(0).args.pop();
    expect(requestOptions).to.have.property('json', true);
    expect(requestOptions.uri).to.equal(`${args.idamApiUrl}/o/userinfo`);
    expect(requestOptions.headers.Authorization).to.contain(token);
  });
});
