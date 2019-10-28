import { NextFunction, Request, Response } from 'express';
import {
  getTypeOfAppeal,
  postTypeOfAppeal,
  setupTypeOfAppealController
} from '../../../app/controllers/type-of-appeal';
import AppealTypes from '../../../app/domain/appeal-types';
import { paths } from '../../../app/paths';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

const express = require('express');

describe('Type of appeal Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {} as any,
      cookies: {},
      idam: {
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');
    const routerPOSTStub: sinon.SinonStub = sandbox.stub(express.Router, 'post');

    setupTypeOfAppealController();
    expect(routerGetStub).to.have.been.calledWith(paths.typeOfAppeal);
    expect(routerPOSTStub).to.have.been.calledWith(paths.typeOfAppeal);
  });

  it('getTypeOfAppeal should render type-of-appeal.njk', () => {
    getTypeOfAppeal(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk');
  });

  it('postTypeOfAppeal when clicked on save-and-continue with no selections should render type-of-appeal.njk with a validation error', () => {
    req.body = { 'button': 'save-and-continue', 'data': [] };

    postTypeOfAppeal(req as Request, res as Response, next);

    const appealTypes = new AppealTypes();
    const expectedError = 'You must select at least one option';
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', { appealTypes, error: expectedError });
  });

  it('postTypeOfAppeal when clicked on save-and-continue with only one selection should redirect to the next page', () => {
    req.body = { 'button': 'save-and-continue', 'data': [ 'human-rights' ] };

    postTypeOfAppeal(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledOnce.calledWith('/task-list');
  });

  it('postTypeOfAppeal when clicked on save-for-later with no selections should render type-of-appeal.njk with a validation error', () => {
    req.body = { 'button': 'save-for-later', 'data': [] };

    postTypeOfAppeal(req as Request, res as Response, next);

    const appealTypes = new AppealTypes();
    const expectedError = 'You must select at least one option';
    expect(res.render).to.have.been.calledOnce.calledWith('appeal-application/type-of-appeal.njk', { appealTypes, error: expectedError });

  });

  it('postTypeOfAppeal when clicked on save-and-continue with multiple selections should redirect to the next page', () => {
    req.body = { 'button': 'save-and-continue', 'data': [ 'human-rights', 'eea', 'protection' ] };

    postTypeOfAppeal(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledOnce.calledWith('/task-list');
  });

  it('postTypeOfAppeal when clicked on save-for-later with only one selection should redirect to the home page', () => {
    req.body = { 'button': 'save-for-later', 'data': [ 'human-rights' ] };

    postTypeOfAppeal(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledOnce.calledWith('/task-list');
  });

  it('postTypeOfAppeal when clicked on save-for-later with multiple selections should redirect to the home page', () => {
    req.body = { 'button': 'save-for-later', 'data': [ 'human-rights', 'eea', 'protection' ] };

    postTypeOfAppeal(req as Request, res as Response, next);

    expect(res.redirect).to.have.been.calledOnce.calledWith('/task-list');
  });

  it('getTypeOfAppeal should catch exception and call next with the error', () => {
    const error = new Error('an error');
    res.render = sandbox.stub().throws(error);
    getTypeOfAppeal(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });

  it('postTypeOfAppeal should catch exception and call next with the error', () => {
    const error = new Error('an error');
    req.body = { 'button': 'save-for-later', 'data': [ 'human-rights', 'eea', 'protection' ] };
    res.redirect = sandbox.stub().throws(error);
    postTypeOfAppeal(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
