const sinon = require('sinon');
const { expect } = require('chai');
const request = require('request-promise-native');
const accessToken = require('./accessToken');

describe('accessToken', () => {
  const args = {};

  beforeEach(() => {
    sinon.stub(request, 'post');
  });

  afterEach(() => {
    request.post.restore();
  });

  it('makes the request to obtain oauth token', () => {
    // Arrange.
    const options = { field: 'value' };
    args.idamApiUrl = 'some-url';
    args.idamClientID = 'some-id';
    args.idamSecret = 'some-secret';
    // Act.
    accessToken(options, args);
    // Assert.
    expect(request.post.calledOnce).to.equal(true);
    const requestOptions = request.post.getCall(0).args.pop();
    expect(requestOptions).to.have.property('json', true);
    expect(requestOptions).to.have.nested.property('auth.user', args.idamClientID);
    expect(requestOptions).to.have.nested.property('auth.pass', args.idamSecret);
    expect(requestOptions).to.have.nested.property('form.field', options.field);
    expect(requestOptions.uri).to.equal(`${args.idamApiUrl}/oauth2/token`);
  });

  it('makes the request to obtain openId token', () => {
    // Arrange.
    const options = { field: 'value' };
    args.idamApiUrl = 'some-url';
    args.idamClientID = 'some-id';
    args.idamSecret = 'some-secret';
    args.openId = true;
    // Act.
    accessToken(options, args);
    // Assert.
    expect(request.post.calledOnce).to.equal(true);
    const requestOptions = request.post.getCall(0).args.pop();
    expect(requestOptions).to.have.property('json', true);
    expect(requestOptions).to.have.nested.property('form.field', options.field);
    expect(requestOptions).to.have.nested.property('form.client_id', args.idamClientID);
    expect(requestOptions).to.have.nested.property('form.client_secret', args.idamSecret);
    expect(requestOptions.uri).to.equal(`${args.idamApiUrl}/o/token`);
  });
});
