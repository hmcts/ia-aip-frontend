import { NextFunction, Request, Response } from 'express';
import {
  getHearingRequirementsConfirmationPage,
  setupHearingRequirementsConfirmationPage
} from '../../../../app/controllers/hearing-requirements/confirmation-page';
import { paths } from '../../../../app/paths';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import { addDaysToDate } from '../../../../app/utils/date-utils';
import Logger from '../../../../app/utils/logger';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

const express = require('express');

describe('Confirmation Page Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          reasonsForAppeal: {
          }
        }
      } as Partial<Appeal>,
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

    updateAppealService = { submitEvent: sandbox.stub() };

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
    const middleware = [];

    setupHearingRequirementsConfirmationPage(middleware);
    expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.confirmation, middleware);
  });

  it('getConfirmationPage should render confirmation.njk', () => {
    getHearingRequirementsConfirmationPage(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('templates/confirmation-page.njk', {
      title: i18n.pages.hearingRequirements.confirmation.title,
      whatNextListItems: i18n.pages.hearingRequirements.confirmation.whatNextListItems,
      info: i18n.pages.hearingRequirements.confirmation.info,
      date: addDaysToDate(14)
    });
  });

  it('getConfirmationPage should catch an exception and call next()', () => {
    const error = new Error('the error');
    res.render = sandbox.stub().throws(error);
    getHearingRequirementsConfirmationPage(req as Request, res as Response, next);
    expect(next).to.have.been.calledOnce.calledWith(error);
  });
});
