import express, { NextFunction, Request, Response } from 'express';
import {
  getBringMultimediaEquipmentQuestion,
  postBringMultimediaEquipmentQuestion,
  setupBringMultimediaEquipmentQuestionController
} from '../../../../../app/controllers/cma-requirements/other-needs/bring-equipment-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('CMA Requirements - Other Needs Section: Bring Equipment Question controller', () => {
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
        } as Partial<Appeal>
      }
    } as Partial<Request>;

    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.spy();

    res = {
      render: renderStub,
      redirect: redirectStub
    } as Partial<Response>;
    next = sandbox.stub();
    updateAppealService = { submitEvent: submitStub } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupBringMultimediaEquipmentQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupBringMultimediaEquipmentQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion)).to.equal(true);
    });
  });

  describe('getBringMultimediaEquipmentQuestion', () => {
    it('should render question page', () => {

      getBringMultimediaEquipmentQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/appointment-multimedia-evidence-equipment',
        pageTitle: 'Will you bring the equipment to play this evidence?',
        previousPage: '/appointment-other-needs',
        question: {
          description: 'For example, a laptop or DVD player.',
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Will you bring the equipment to play this evidence?'
        },
        saveAndContinue: true
      };
      expect(renderStub).to.be.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      getBringMultimediaEquipmentQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postBringMultimediaEquipmentQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postBringMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          href: '#answer',
          key: 'answer',
          text: 'Select yes if you will bring the equipment to play this evidence'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/appointment-multimedia-evidence-equipment',
        pageTitle: 'Will you bring the equipment to play this evidence?',
        previousPage: '/appointment-other-needs',
        question: {
          options: [ { text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' } ],
          title: 'Will you bring the equipment to play this evidence?',
          description: 'For example, a laptop or DVD player.'
        },
        saveAndContinue: true

      };
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postBringMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment)).to.equal(true);
      expect(req.session.appeal.cmaRequirements.otherNeeds.bringOwnMultimediaEquipment).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postBringMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_CMA_REQUIREMENTS, req)).to.equal(true);
      expect(redirectStub.calledWith(paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason)).to.equal(true);
      expect(req.session.appeal.cmaRequirements.otherNeeds.bringOwnMultimediaEquipment).to.equal(false);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postBringMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
