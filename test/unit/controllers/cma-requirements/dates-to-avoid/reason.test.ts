import express, { NextFunction, Request, Response } from 'express';
import {
  getDatesToAvoidReason, getDatesToAvoidReasonWithId, postDatesToAvoidReason, postDatesToAvoidReasonWithId,
  setupDatesToAvoidReasonController
} from '../../../../../app/controllers/cma-requirements/dates-to-avoid/reason';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Reason controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  const datesToAvoid: CmaDateToAvoid[] = [
    {
      date: {
        day: '20',
        month: '6',
        year: '2020'
      }
    }
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          cmaRequirements: {
            datesToAvoid: {
              isDateCannotAttend: true,
              dates: datesToAvoid
            }
          }
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEvent: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDatesToAvoidReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupDatesToAvoidReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidReason);
      expect(routerGetStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidReasonWithId);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidReason);
      expect(routerPostStub).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidReasonWithId);
    });
  });

  describe('getDatesToAvoidReason', () => {
    it('should render template', () => {
      getDatesToAvoidReason(req as Request, res as Response, next);
      const expectedArgs = {
        formAction: '/appointment-dates-avoid-reasons',
        pageTitle: 'Why can you not go to the appointment on this date?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Why can you not go to the appointment on this date?',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getDatesToAvoidReason(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDatesToAvoidReasonWithId', () => {
    it('should render template with previously saved answer', () => {
      req.params.id = '0';
      req.session.appeal.cmaRequirements.datesToAvoid.dates[0].reason = 'Previously saved reason';
      const expectedArgs = {
        formAction: '/appointment-dates-avoid-reasons/0',
        pageTitle: 'Why can you not go to the appointment on this date?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Why can you not go to the appointment on this date?',
          value: 'Previously saved reason'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      getDatesToAvoidReasonWithId(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should catch error and call next with error', () => {
      req.params.id = '0';

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getDatesToAvoidReasonWithId(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDatesToAvoidReason', () => {
    it('should fail validation and render template with errors', async () => {

      await postDatesToAvoidReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk');
    });

    it('should validate and redirect to add another date page', async () => {
      req.body['reason'] = 'the answer here';
      await postDatesToAvoidReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.datesToAvoidAddAnotherDate);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postDatesToAvoidReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postDatesToAvoidReasonWithId', () => {
    it('should fail validation and render template with errors', async () => {
      req.params.id = '0';

      await postDatesToAvoidReasonWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter details of why you cannot go to the appointment on this date'
        }
      };
      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-dates-avoid-reasons/0',
        pageTitle: 'Why can you not go to the appointment on this date?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'reason',
          title: 'Why can you not go to the appointment on this date?',
          value: 'Previously saved reason'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      expect(res.render).to.have.been.calledWith('templates/textarea-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to CYA page', async () => {
      req.params.id = '0';

      req.body['reason'] = 'the answer here';
      await postDatesToAvoidReasonWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(updateAppealService.submitEvent).to.have.been.calledWith(Events.EDIT_CMA_REQUIREMENTS, req);
      expect(res.redirect).to.have.been.calledWith(paths.awaitingCmaRequirements.checkAndSend);
    });

    it('should catch error and call next with error', async () => {
      req.params.id = '0';

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postDatesToAvoidReasonWithId(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
