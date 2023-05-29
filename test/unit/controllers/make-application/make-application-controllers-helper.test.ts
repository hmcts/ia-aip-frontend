import { NextFunction, Request, Response } from 'express';
import { makeApplicationControllersHelper } from '../../../../app/controllers/make-application/make-application-controllers-helper';
import { paths } from '../../../../app/paths';
import { DocumentManagementService } from '../../../../app/service/document-management-service';
import UpdateAppealService from '../../../../app/service/update-appeal-service';
import i18n from '../../../../locale/en.json';
import { expect, sinon } from '../../../utils/testUtils';

describe('Make application controllers helper', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let config;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      query: {},
      body: {},
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
      },
      params: {},
      session: {
        appeal: {
          application: {},
          documentMap: []
        }
      }
    } as Partial<Request>;
    res = {
      render: sandbox.stub(),
      redirect: sandbox.spy(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
    config = {};
    updateAppealService = {
      submitEventRefactored: sandbox.stub(),
      updateAppealService: sandbox.stub()
    } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getProvideMakeAnApplicationDetails', () => {
    it('should render', () => {
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      config = {
        validationErrors: undefined,
        makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askHearingSooner.description,
        makeAnApplicationDetailsHint: i18n.pages.makeApplication.askHearingSooner.hint,
        makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askHearingSooner.title,
        formAction: paths.makeApplication.expedite,
        ableToAddEvidenceTitle: i18n.pages.makeApplication.askHearingSooner.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: i18n.pages.makeApplication.askHearingSooner.ableToAddEvidenceAdvice
      };

      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: config.makeAnApplicationDetailsDescription,
        hint: config.makeAnApplicationDetailsHint
      };

      const expectedRenderPayload = {
        previousPage: paths.makeApplication.askChangeHearing,
        title: config.makeAnApplicationDetailsTitle,
        formAction: config.formAction,
        supportingEvidence: true,
        ableToAddEvidenceTitle: config.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: config.ableToAddEvidenceAdvice,
        question
      };
      makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req as Request, res as Response, next, config);

      expect(res.render).to.have.been.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render with error', () => {
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      req.query.error = 'the error';
      const errorList = [
        {
          key: 'askChangeHearing',
          text: 'Select what you want to ask to change about your hearing',
          href: '#askChangeHearing'
        }
      ];

      config = {
        validationErrors: errorList,
        makeAnApplicationDetailsDescription: i18n.pages.makeApplication.askHearingSooner.description,
        makeAnApplicationDetailsHint: i18n.pages.makeApplication.askHearingSooner.hint,
        makeAnApplicationDetailsTitle: i18n.pages.makeApplication.askHearingSooner.title,
        formAction: paths.makeApplication.expedite,
        ableToAddEvidenceTitle: i18n.pages.makeApplication.askHearingSooner.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: i18n.pages.makeApplication.askHearingSooner.ableToAddEvidenceAdvice
      };

      const question = {
        name: 'makeAnApplicationDetails',
        value: req.session.appeal.makeAnApplicationDetails,
        description: config.makeAnApplicationDetailsDescription,
        hint: config.makeAnApplicationDetailsHint
      };

      const expectedRenderPayload = {
        previousPage: paths.makeApplication.askChangeHearing,
        title: config.makeAnApplicationDetailsTitle,
        formAction: config.formAction,
        supportingEvidence: true,
        ableToAddEvidenceTitle: config.ableToAddEvidenceTitle,
        ableToAddEvidenceAdvice: config.ableToAddEvidenceAdvice,
        errorList,
        error: [...errorList],
        question
      };
      makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req as Request, res as Response, next, config);

      expect(res.render).to.have.been.calledWith('make-application/details-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should redirect to ask-change-hearing page', () => {
      makeApplicationControllersHelper.getProvideMakeAnApplicationDetails(req as Request, res as Response, next, config);

      expect(res.redirect).to.have.been.calledWith(paths.makeApplication.askChangeHearing);
    });
  });

  describe('postProvideMakeAnApplicationDetails', () => {
    it('should redirect to success path', () => {
      req.body['makeAnApplicationDetails'] = 'reason for request';
      const redirectToSuccessPath = paths.makeApplication.supportingEvidenceExpedite;
      const redirectToErrorPath = `${paths.makeApplication.expedite}?error=askHearingSooner`;
      makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req as Request, res as Response, next, redirectToSuccessPath, redirectToErrorPath);

      expect(res.redirect).to.have.been.calledWith(redirectToSuccessPath);
    });

    it('should redirect with error', () => {
      const redirectToSuccessPath = paths.makeApplication.supportingEvidenceExpedite;
      const redirectToErrorPath = `${paths.makeApplication.expedite}?error=askHearingSooner`;
      makeApplicationControllersHelper.postProvideMakeAnApplicationDetails(req as Request, res as Response, next, redirectToSuccessPath, redirectToErrorPath);

      expect(res.redirect).to.have.been.calledWith(redirectToErrorPath);
    });
  });

  describe('getProvideSupportingEvidenceYesOrNo', () => {
    it('should render', () => {
      const previousPage = paths.makeApplication.expedite;
      const formAction = paths.makeApplication.supportingEvidenceExpedite;

      const question = {
        title: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.title,
        name: 'answer',
        titleIsheading: true,
        options: [
          {
            value: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.value,
            text: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.text,
            checked: false
          },
          {
            value: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.no.value,
            text: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.no.text,
            checked: false
          }
        ],
        inline: true
      };

      const expectedRenderPayload = {
        previousPage,
        pageTitle: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.title,
        formAction,
        question,
        saveAndContinue: false
      };
      makeApplicationControllersHelper.getProvideSupportingEvidenceYesOrNo(req as Request, res as Response, next, previousPage, formAction);
      expect(res.render).to.have.been.calledWith('make-application/radio-button-question-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render with error', () => {
      const previousPage = paths.makeApplication.expedite;
      const formAction = paths.makeApplication.supportingEvidenceExpedite;
      req.query.error = 'the error';
      const errorList = [
        {
          key: 'supportingEvidenceRequired',
          text: 'Select Yes if you want to provide supporting evidence',
          href: '#supportingEvidenceRequired'
        }
      ];

      const error = {
        supportingEvidenceRequired: {
          key: 'supportingEvidenceRequired',
          text: 'Select Yes if you want to provide supporting evidence',
          href: '#supportingEvidenceRequired'
        }
      };

      const question = {
        title: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.title,
        name: 'answer',
        titleIsheading: true,
        options: [
          {
            value: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.value,
            text: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.yes.text,
            checked: false
          },
          {
            value: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.no.value,
            text: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.options.no.text,
            checked: false
          }
        ],
        inline: true
      };

      const expectedRenderPayload = {
        previousPage,
        pageTitle: i18n.pages.makeApplication.provideSupportingEvidenceYesOrNo.title,
        formAction,
        question,
        errorList,
        error,
        saveAndContinue: false
      };
      makeApplicationControllersHelper.getProvideSupportingEvidenceYesOrNo(req as Request, res as Response, next, previousPage, formAction);
      expect(res.render).to.have.been.calledWith('make-application/radio-button-question-page.njk', {
        ...expectedRenderPayload
      });
    });
  });

  describe('postProvideSupportingEvidenceYesOrNo', () => {
    it('should redirect to provide supporting evidence page', () => {
      req.body['answer'] = 'yes';
      const config = {
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite,
        pathToSupportingEvidence: paths.makeApplication.supportingEvidenceExpedite,
        pathToCheckAnswer: paths.makeApplication.checkAnswerExpedite
      };
      makeApplicationControllersHelper.postProvideSupportingEvidenceYesOrNo(req as Request, res as Response, next, config);

      expect(res.redirect).to.have.been.calledWith(config.pathToProvideSupportingEvidence);
    });

    it('should redirect to check answer page', () => {
      req.body['answer'] = 'no';
      const config = {
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite,
        pathToSupportingEvidence: paths.makeApplication.supportingEvidenceExpedite,
        pathToCheckAnswer: paths.makeApplication.checkAnswerExpedite
      };
      makeApplicationControllersHelper.postProvideSupportingEvidenceYesOrNo(req as Request, res as Response, next, config);

      expect(res.redirect).to.have.been.calledWith(config.pathToCheckAnswer);
    });

    it('should redirect with error', () => {
      const config = {
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite,
        pathToSupportingEvidence: paths.makeApplication.supportingEvidenceExpedite,
        pathToCheckAnswer: paths.makeApplication.checkAnswerExpedite
      };
      makeApplicationControllersHelper.postProvideSupportingEvidenceYesOrNo(req as Request, res as Response, next, config);

      expect(res.redirect).to.have.been.calledWith(`${config.pathToSupportingEvidence}?error=supportingEvidenceRequired`);
    });
  });

  describe('getProvideSupportingEvidence', () => {
    it('should render', () => {
      const config = {
        evidenceUploadAction: paths.makeApplication.provideSupportingEvidenceUploadFile,
        evidenceCTA: paths.makeApplication.provideSupportingEvidenceDeleteFile,
        previousPage: paths.makeApplication.supportingEvidenceExpedite,
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite
      };

      const expectedRenderPayload = {
        title: i18n.pages.makeApplication.provideSupportingEvidence.title,
        adviceHeader: i18n.pages.makeApplication.provideSupportingEvidence.adviceHeader,
        advice: i18n.pages.makeApplication.provideSupportingEvidence.advice,
        evidenceUploadAction: config.evidenceUploadAction,
        evidences: req.session.appeal.makeAnApplicationEvidence || [],
        evidenceCTA: config.evidenceCTA,
        previousPage: config.previousPage,
        formSubmitAction: config.pathToProvideSupportingEvidence
      };
      makeApplicationControllersHelper.getProvideSupportingEvidence(req as Request, res as Response, next, config);
      expect(res.render).to.have.been.calledWith('make-application/supporting-evidence-upload-page.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render with error', () => {
      req.query.error = 'noFileSelected';
      const errorList = [{ key: 'uploadFile', text: 'Select a file', href: '#uploadFile' }];
      const error = {
        uploadFile: {
          key: 'uploadFile',
          text: 'Select a file',
          href: '#uploadFile'
        }
      };

      const config = {
        evidenceUploadAction: paths.makeApplication.provideSupportingEvidenceUploadFile,
        evidenceCTA: paths.makeApplication.provideSupportingEvidenceDeleteFile,
        previousPage: paths.makeApplication.supportingEvidenceExpedite,
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite
      };

      const expectedRenderPayload = {
        title: i18n.pages.makeApplication.provideSupportingEvidence.title,
        adviceHeader: i18n.pages.makeApplication.provideSupportingEvidence.adviceHeader,
        advice: i18n.pages.makeApplication.provideSupportingEvidence.advice,
        evidenceUploadAction: config.evidenceUploadAction,
        evidences: req.session.appeal.makeAnApplicationEvidence || [],
        evidenceCTA: config.evidenceCTA,
        previousPage: config.previousPage,
        errorList,
        error,
        formSubmitAction: config.pathToProvideSupportingEvidence
      };
      makeApplicationControllersHelper.getProvideSupportingEvidence(req as Request, res as Response, next, config);
      expect(res.render).to.have.been.calledWith('make-application/supporting-evidence-upload-page.njk', {
        ...expectedRenderPayload
      });
    });
  });

  describe('postProvideSupportingEvidence', () => {
    it('should redirect to check your answers page', () => {
      req.session.appeal.makeAnApplicationEvidence = [{
        fileId: 'fileId',
        name: 'theFileName'
      }];
      const config = {
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite,
        pathToCheckYourAnswer: paths.makeApplication.checkAnswerExpedite
      };
      makeApplicationControllersHelper.postProvideSupportingEvidence(req as Request, res as Response, next, config);

      expect(res.redirect).to.have.been.calledWith(config.pathToCheckYourAnswer);
    });

    it('should redirect with error', () => {
      const config = {
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite,
        pathToCheckYourAnswer: paths.makeApplication.checkAnswerExpedite
      };
      makeApplicationControllersHelper.postProvideSupportingEvidence(req as Request, res as Response, next, config);

      expect(res.redirect).to.have.been.calledWith(`${config.pathToProvideSupportingEvidence}?error=noFileSelected`);
    });
  });

  describe('getProvideSupportingEvidenceCheckAndSend', () => {
    it('should render', () => {
      req.session.appeal.makeAnApplicationProvideEvidence = 'yes';
      req.session.appeal.makeAnApplications = [];
      const config = {
        pathToProvideSupportingEvidenceNoLeadingSlash: 'provide-supporting-evidence-hearing-sooner',
        pathToMakeApplicationDetailsNoLeadingSlash: 'ask-hearing-sooner',
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite,
        pathToSupportingEvidence: paths.makeApplication.supportingEvidenceExpedite,
        pathToCheckYourAnswer: paths.makeApplication.checkAnswerExpedite
      };
      const previousPage = config.pathToProvideSupportingEvidence;
      const summaryLists: SummaryList[] = [{ summaryRows: [] }];

      const expectedRenderPayload = {
        pageTitle: i18n.pages.makeApplication.checkYourAnswers.title,
        continuePath: config.pathToCheckYourAnswer,
        previousPage,
        summaryLists
      };
      makeApplicationControllersHelper.getProvideSupportingEvidenceCheckAndSend(req as Request, res as Response, next, config);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', {
        ...expectedRenderPayload
      });
    });

    it('should render when no supporting evidence', () => {
      req.session.appeal.makeAnApplicationProvideEvidence = 'no';
      req.session.appeal.makeAnApplications = [];
      const config = {
        pathToProvideSupportingEvidenceNoLeadingSlash: 'provide-supporting-evidence-hearing-sooner',
        pathToProvideSupportingEvidence: paths.makeApplication.provideSupportingEvidenceExpedite,
        pathToSupportingEvidence: paths.makeApplication.supportingEvidenceExpedite,
        pathToCheckYourAnswer: paths.makeApplication.checkAnswerExpedite
      };
      const previousPage = config.pathToSupportingEvidence;
      const summaryLists: SummaryList[] = [{ summaryRows: [] }];

      const expectedRenderPayload = {
        pageTitle: i18n.pages.makeApplication.checkYourAnswers.title,
        continuePath: config.pathToCheckYourAnswer,
        previousPage,
        summaryLists
      };
      makeApplicationControllersHelper.getProvideSupportingEvidenceCheckAndSend(req as Request, res as Response, next, config);
      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', {
        ...expectedRenderPayload
      });
    });
  });

  describe('postProvideSupportingEvidenceCheckAndSend', () => {
    it('should submit application successfully', async () => {
      const evidence: Evidence[] = [];
      req.session.appeal.makeAnApplicationDetails = 'makeAnAppealDetails';
      req.session.appeal.makeAnApplicationEvidence = evidence;
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };
      await makeApplicationControllersHelper.postProvideSupportingEvidenceCheckAndSend(updateAppealService as UpdateAppealService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.makeApplication.requestSent);
      expect(req.session.appeal.makeAnApplicationEvidence.length).to.eq(0);
      expect(req.session.appeal.makeAnApplicationDetails).to.eq(undefined);
      expect(req.session.appeal.makeAnApplicationTypes).to.eq(undefined);
      expect(req.session.appeal.makeAnApplicationProvideEvidence).to.eq(undefined);
    });
  });

  describe('getRequestSent', () => {
    it('should render', async () => {
      makeApplicationControllersHelper.getRequestSent(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk', {
        title: i18n.pages.makeApplication.requestSent.title,
        whatNextContent: i18n.pages.makeApplication.requestSent.whatNextContent
      });
    });
  });

  describe('uploadSupportingEvidence', () => {
    it('should upload evidence successfully', async () => {
      const redirectTo = paths.makeApplication.provideSupportingEvidenceExpedite;
      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Express.Multer.File;
      req.file = mockFile;
      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'name.png'
      };
      const makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };
      req.session.appeal.makeAnApplicationTypes = makeAnApplicationTypes;
      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [documentMap];
      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await makeApplicationControllersHelper.uploadSupportingEvidence(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect((req.session.appeal.makeAnApplicationEvidence || [])[0].fileId === documentUploadResponse.fileId);
      expect((req.session.appeal.makeAnApplicationEvidence || [])[0].name === documentUploadResponse.name);
      expect(res.redirect).to.have.been.calledWith(redirectTo);
    });

    it('should redirect with error', async () => {
      const redirectTo = paths.makeApplication.provideSupportingEvidenceExpedite;
      const makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };
      req.session.appeal.makeAnApplicationTypes = makeAnApplicationTypes;

      await makeApplicationControllersHelper.uploadSupportingEvidence(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${redirectTo}?error=noFileSelected`);
    });
  });

  describe('deleteSupportingEvidence', () => {
    it('should delete a supporting evidence', async () => {
      const redirectTo = paths.makeApplication.provideSupportingEvidenceExpedite;
      const makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };
      const deleteEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: '1', url: 'docStoreURLToFile' };
      req.session.appeal.makeAnApplicationEvidence = [{ fileId: '1', name: 'name' } as Evidence];
      req.session.appeal.documentMap = [{ ...documentMap }];
      req.query.id = '1';
      req.session.appeal.makeAnApplicationTypes = makeAnApplicationTypes;
      const appeal: Appeal = { ...req.session.appeal };

      await makeApplicationControllersHelper.deleteSupportingEvidence(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(req.session.appeal.makeAnApplicationEvidence.length).to.eq(0);
      expect(req.session.appeal.documentMap.length).to.eq(0);
      expect(res.redirect).to.have.been.calledWith(redirectTo);
    });
  });

  describe('buildSupportingEvidenceDocumentsSummaryList', () => {

    it('should build a list in correct format', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      const expectedSummaryList: SummaryList[] = [
        {
          'summaryRows': [
            {
              'actions': {
                'items': [
                  {
                    'href': 'provide-supporting-evidence-hearing-sooner',
                    'text': 'Change'
                  }
                ]
              },
              'key': {
                'text': 'Supporting evidence'
              },
              'value': {
                'html': '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/aFileId\'>fileName</a>'
              }
            }
          ]
        }
      ];

      req.session.appeal.makeAnApplicationDetails = 'makeAnApplicationDetails';
      req.session.appeal.makeAnApplicationEvidence = mockEvidenceDocuments;
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      const result = makeApplicationControllersHelper.buildSupportingEvidenceDocumentsSummaryList(req as Request, 'provide-supporting-evidence-hearing-sooner', 'ask-hearing-sooner');

      expect(result[0].summaryRows[2].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[2].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
    });

    it('should return supporting evidence document list', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];
      req.session.appeal.makeAnApplicationDetails = 'makeAnApplicationDetails';
      req.session.appeal.makeAnApplicationEvidence = mockEvidenceDocuments;
      req.session.appeal.makeAnApplicationTypes = {
        value: {
          code: 'expedite',
          label: 'Expedite'
        }
      };

      const result = makeApplicationControllersHelper.buildSupportingEvidenceDocumentsSummaryList(req as Request, 'provide-supporting-evidence-hearing-sooner', 'ask-hearing-sooner');

      expect(result[0].summaryRows).to.be.lengthOf(3);
    });
  });

  describe('getPath', () => {
    it('should return valid path', async () => {
      const expectedPath = '/check-answer-hearing-sooner';
      const actualPath = makeApplicationControllersHelper.getPath('checkAnswer', 'expedite');

      expect(actualPath === expectedPath);
    });

    it('should return valid path when pathPrefix is empty', async () => {
      const expectedPath = '/ask-hearing-sooner';
      const actualPath = makeApplicationControllersHelper.getPath('', 'expedite');

      expect(actualPath === expectedPath);
    });
  });
});
