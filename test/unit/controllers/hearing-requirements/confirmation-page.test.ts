import express, { NextFunction, Request, Response } from 'express';
import { getConfirmationPage } from '../../../../app/controllers/cma-requirements/confirmation-page';
import { setupHearingRequirementsConfirmationPage } from '../../../../app/controllers/hearing-requirements/confirmation-page';
import { paths } from '../../../../app/paths';
import { addDaysToDate } from '../../../../app/utils/date-utils';
import { expect, sinon } from '../../../utils/testUtils';

describe('Hearing Requirements Confirmation Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {}
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingRequirementsConfirmationPage', () => {
    it('should set the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const middleware: Middleware[] = [];

      setupHearingRequirementsConfirmationPage(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.confirmation);
    });
  });

  describe('getConfirmationPage', () => {
    it('should render CYA template', () => {
      const expectedArgs = {
        date: addDaysToDate(14),
        title: 'You have sent your appointment needs',
        whatNextListItems: [
          'A Tribunal Caseworker will look at your appointment needs. If you have asked for an interpreter, step-free access or a hearing loop, these will be provided. If you have asked for anything else, it will be considered but may not be provided',
          'A Tribunal Caseworker will then contact you to tell you where and when the appointment will take place and what will be provided',
          'This should be by <b>{{ date }}</b> but may take longer than that' ],
        info: {
          title: 'Helpful Information',
          url: "<a href='{{ paths.common.whatToExpectAtCMA }}'>What to expect at a case management appointment</a>"
        }
      };
      getConfirmationPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk', expectedArgs);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getConfirmationPage(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
