import express, { NextFunction, Request, Response } from 'express';

import {
  getMultimediaEquipmentReason,
  postMultimediaEquipmentReason,
  setupMultimediaEquipmentReasonController
} from '../../../../../app/controllers/cma-requirements/other-needs/bring-equipment-reason';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Bring Equipment Reason controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let updateAppealService: Partial<UpdateAppealService>;
  let renderStub: sinon.SinonStub;
  let redirectStub: sinon.SinonSpy;
  let submitStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      params: {},
      session: {
        appeal: {
          cmaRequirements: {
            otherNeeds: {}
          }
        }
      }
    } as Partial<Request>;
    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.spy();

    updateAppealService = { submitEvent: submitStub } as Partial<UpdateAppealService>;

    res = {
      render: renderStub,
      send: sandbox.stub(),
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupMultimediaEquipmentReasonController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupMultimediaEquipmentReasonController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason)).to.equal(true);
    });
  });

  describe('getMultimediaEquipmentReason', () => {
    it('should render template', () => {

      const expectedArgs = {
        formAction: '/appointment-multimedia-evidence-equipment-reasons',
        pageTitle: 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it',
        previousPage: '/appointment-multimedia-evidence-equipment',
        question: {
          name: 'reason',
          title: 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getMultimediaEquipmentReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should render template with saved answer', () => {

      req.session.appeal.cmaRequirements.otherNeeds.bringOwnMultimediaEquipmentReason = 'previously saved answer';

      const expectedArgs = {
        formAction: '/appointment-multimedia-evidence-equipment-reasons',
        pageTitle: 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it',
        previousPage: '/appointment-multimedia-evidence-equipment',
        question: {
          name: 'reason',
          title: 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it',
          value: 'previously saved answer'
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };

      getMultimediaEquipmentReason(req as Request, res as Response, next);
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getMultimediaEquipmentReason(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postMultimediaEquipmentReason', () => {
    it('should fail validation and render template with errors', async () => {
      await postMultimediaEquipmentReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        reason: {
          href: '#reason',
          key: 'reason',
          text: 'Enter the reasons it is not possible to bring the equipment to play this evidence and what you will need to play it'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-multimedia-evidence-equipment-reasons',
        pageTitle: 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it',
        previousPage: '/appointment-multimedia-evidence-equipment',
        question: {
          name: 'reason',
          title: 'Tell us why it is not possible to bring the equipment to play this evidence and what you will need to play it',
          value: ''
        },
        supportingEvidence: false,
        timeExtensionAllowed: false
      };
      expect(renderStub.calledWith('templates/textarea-question-page.njk', expectedArgs)).to.equal(true);

    });

    it('should validate and redirect to next page', async () => {
      req.body['reason'] = 'the answer here';
      await postMultimediaEquipmentReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment)).to.equal(true);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postMultimediaEquipmentReason(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

});
