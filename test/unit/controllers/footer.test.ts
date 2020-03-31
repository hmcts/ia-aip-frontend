import { NextFunction, Request, Response } from 'express';
import { getCookiesPage,
    getPrivacyPolicyPage,
    getTermsAndConditionsPage,
    setupFooterController } from '../../../app/controllers/footer';
import { paths } from '../../../app/paths';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('footer controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {} as Partial<Request>;
    res = {
      render: sandbox.stub()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

    setupFooterController();
    expect(routerGetStub).to.have.been.calledWith(paths.common.cookies);
    expect(routerGetStub).to.have.been.calledWith(paths.common.privacyPolicy);
    expect(routerGetStub).to.have.been.calledWith(paths.common.termsAndConditions);
  });

  it('should render cookies page', () => {
    getCookiesPage(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('footer/cookies.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  });

  it('should render privacy policy', () => {
    getPrivacyPolicyPage(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('footer/privacy-policy.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  });

  it('should render terms and conditions page', () => {
    getTermsAndConditionsPage(req as Request, res as Response, next);

    expect(res.render).to.have.been.calledWith('footer/terms-and-conditions.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  });

});
