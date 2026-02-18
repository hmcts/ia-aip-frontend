import { NextFunction, Request, Response } from 'express';
import {
  getAccessibilityPage,
  getCookiesPage,
  getPrivacyPolicyPage,
  getTermsAndConditionsPage,
  setupFooterController
} from '../../../app/controllers/footer';
import { paths } from '../../../app/paths';
import { expect, sinon } from '../../utils/testUtils';
const express = require('express');

describe('footer controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {} as Partial<Request>;
    res = {
      render: sandbox.stub()
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

    setupFooterController();
    expect(routerGetStub.calledWith(paths.common.cookies)).to.equal(true);
    expect(routerGetStub.calledWith(paths.common.privacyPolicy)).to.equal(true);
    expect(routerGetStub.calledWith(paths.common.termsAndConditions)).to.equal(true);
    expect(routerGetStub.calledWith(paths.common.accessibility)).to.equal(true);
  });

  it('should render cookies page', () => {
    getCookiesPage(req as Request, res as Response, next);

    expect(res.render).to.be.calledWith('footer/cookies.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  });

  it('should render privacy policy', () => {
    getPrivacyPolicyPage(req as Request, res as Response, next);

    expect(res.render).to.be.calledWith('footer/privacy-policy.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  });

  it('should render terms and conditions page', () => {
    getTermsAndConditionsPage(req as Request, res as Response, next);

    expect(res.render).to.be.calledWith('footer/terms-and-conditions.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  });

  it('should render accessibility page', () => {
    getAccessibilityPage(req as Request, res as Response, next);

    expect(res.render).to.be.calledWith('footer/accessibility-statement.njk', {
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      }
    });
  });
});
