import express, { NextFunction, Request, Response } from 'express';
import { getConfirmationPage, setupCmaRequirementsConfirmationPage } from '../../../../app/controllers/cma-requirements/confirmation-page';
import { paths } from '../../../../app/paths';
import { addDaysToDate } from '../../../../app/utils/date-utils';
import { expect, sinon } from '../../../utils/testUtils';

describe('Cma Requirements Confirmation Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {}
      }
    } as Partial<Request>;
    renderStub = sandbox.stub();
    res = {
      render: renderStub,
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupCmaRequirementsConfirmationPage', () => {
    it('should set the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const middleware: Middleware[] = [];

      setupCmaRequirementsConfirmationPage(middleware);
      expect(routerGetStub.calledWith(paths.cmaRequirementsSubmitted.confirmation)).to.equal(true);
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
      expect(renderStub.calledWith('templates/confirmation-page.njk', expectedArgs)).to.equal(true);
    });

    it('should call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getConfirmationPage(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
