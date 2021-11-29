import express, { NextFunction, Request, Response } from 'express';
import {
  getHearingMultimediaEvidenceQuestion,
  postHearingMultimediaEvidenceQuestion,
  setupHearingMultimediaEvidenceQuestionController
} from '../../../../../app/controllers/hearing-requirements/other-needs/multimedia-evidence-question';
import { Events } from '../../../../../app/data/events';
import { paths } from '../../../../../app/paths';
import UpdateAppealService from '../../../../../app/service/update-appeal-service';
import { expect, sinon } from '../../../../utils/testUtils';

describe('Hearing Requirements - Other Needs Section: Multimedia Evidence Question controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;

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
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy()
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    updateAppealService = { submitEventRefactored: sandbox.stub() } as Partial<UpdateAppealService>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupHearingMultimediaEvidenceQuestionController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupHearingMultimediaEvidenceQuestionController(middleware, updateAppealService as UpdateAppealService);
      expect(routerGetStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion);
      expect(routerPostStub).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion);
    });
  });

  describe('getHearingMultimediaEvidenceQuestion', () => {
    it('should render question page', () => {

      getHearingMultimediaEvidenceQuestion(req as Request, res as Response, next);

      const expectedArgs = {
        pageTitle: 'Will you bring any video or audio evidence to the hearing?',
        formAction: '/hearing-multimedia-evidence',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Will you bring any video or audio evidence to the hearing?',
          hint: 'For example, video or sound recordings.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        saveAndContinue: true
      };
      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk',
        expectedArgs
      );
    });

    it('should catch error and call next with error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getHearingMultimediaEvidenceQuestion(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('postHearingMultimediaEvidenceQuestion', () => {
    it('should fail validation and render template with errors', async () => {
      await postHearingMultimediaEvidenceQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

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
        pageTitle: 'Will you bring any video or audio evidence to the hearing?',
        formAction: '/hearing-multimedia-evidence',
        previousPage: { attributes: { onclick: 'history.go(-1); return false;' } },
        question: {
          name: 'answer',
          title: 'Will you bring any video or audio evidence to the hearing?',
          hint: 'For example, video or sound recordings.',
          options: [{ text: 'Yes', value: 'yes' }, { text: 'No', value: 'no' }]
        },
        saveAndContinue: true
      };

      expect(res.render).to.have.been.calledWith('templates/radio-question-page.njk', expectedArgs);
    });

    it('should validate and redirect to answer page if appellant answer yes', async () => {
      req.body['answer'] = 'yes';
      await postHearingMultimediaEvidenceQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsMultimediaEquipmentQuestion);
      expect(req.session.appeal.hearingRequirements.otherNeeds.multimediaEvidence).to.be.true;
    });

    it('should validate if appellant answers no and redirect to task list page', async () => {
      req.body['answer'] = 'no';
      await postHearingMultimediaEvidenceQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(updateAppealService.submitEventRefactored).to.have.been.calledWith(Events.EDIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      expect(res.redirect).to.have.been.calledWith(paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion);
      expect(req.session.appeal.hearingRequirements.otherNeeds.multimediaEvidence).to.be.false;
    });

    it('should catch error and call next with error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      await postHearingMultimediaEvidenceQuestion(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });
});
