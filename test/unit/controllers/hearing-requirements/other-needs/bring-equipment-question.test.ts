import express, { NextFunction, Request, Response } from 'express';
import {
  getHearingMultimediaEquipmentQuestion,
  postHearingMultimediaEquipmentQuestion,
  setupHearingMultimediaEquipmentQuestionController
} from '../../../../../app/controllers/hearing-requirements/other-needs/bring-equipment-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Bring Equipment Question controller', () => {
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
          hearingRequirements: {
            otherNeeds: {}
          }
        } as Partial<Appeal>
      },
      idam: {
        userDetails: {
          uid: 'someid'
        }
      },
      cookies: {
        '__auth-token': 'atoken'
      }
    } as Partial<Request>;
    submitStub = sandbox.stub();
    renderStub = sandbox.stub();
    redirectStub = sandbox.spy();

    updateAppealService = { submitEventRefactored: submitStub } as Partial<UpdateAppealService>;

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

  describe('setupHearingMultimediaEquipmentQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingMultimediaEquipmentQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentQuestion)).to.equal(true);
      expect(routerPostStub.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentQuestion)).to.equal(true);
    });
  });

  describe('getHearingMultimediaEquipmentQuestion', () => {
    it('should render question page', () => {

      getHearingMultimediaEquipmentQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        formAction: '/hearing-multimedia-evidence-equipment',
        pageTitle: 'Will you bring the equipment to play this evidence?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }],
          title: 'Will you bring the equipment to play this evidence?',
          hint: 'For example, a laptop computer or DVD player'
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

      getHearingMultimediaEquipmentQuestion(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });

  describe('postHearingMultimediaEquipmentQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postHearingMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      const expectedError = {
        answer: {
          key: 'answer',
          text: 'Select yes if you will bring any audio or video evidence',
          href: '#answer'
        }
      };

      const expectedArgs = {
        error: expectedError,
        errorList: Object.values(expectedError),
        formAction: '/hearing-multimedia-evidence-equipment',
        pageTitle: 'Will you bring the equipment to play this evidence?',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Will you bring the equipment to play this evidence?',
          hint: 'For example, a laptop computer or DVD player',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        saveAndContinue: true

      };
      expect(renderStub.calledWith('templates/radio-question-page.njk', expectedArgs)).to.equal(true);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postHearingMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion)).to.equal(true);
      expect(req.session.appeal.hearingRequirements.otherNeeds.bringOwnMultimediaEquipment).to.equal(true);
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postHearingMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(submitStub.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token'])).to.equal(true);
      expect(redirectStub.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentReason)).to.equal(true);
      expect(req.session.appeal.hearingRequirements.otherNeeds.bringOwnMultimediaEquipment).to.equal(false);
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = renderStub.throws(error);

      await postHearingMultimediaEquipmentQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
