import express, { NextFunction, Request, Response } from 'express';
import {
  buildAddendumEvidenceDocumentsSummaryList,
  buildAdditionalEvidenceDocumentsSummaryList,
  buildUploadedAddendumEvidenceDocumentsSummaryList,
  buildUploadedAdditionalEvidenceDocumentsSummaryList,
  deleteProvideMoreEvidence,
  getAddendumEvidenceDocuments,
  getAdditionalEvidenceDocuments,
  getAppellantAddendumEvidenceDocuments,
  getConfirmation,
  getHomeOfficeEvidenceDocuments,
  getLrAdditionalEvidenceDocuments,
  getProvideMoreEvidence,
  getReasonForLateEvidence,
  getUploadedAddendumEvidenceDocuments,
  postProvideMoreEvidence,
  postProvideMoreEvidenceCheckAndSend,
  postReasonForLateEvidence,
  setupProvideMoreEvidenceController,
  uploadProvideMoreEvidence, validate
} from '../../../app/controllers/upload-evidence/provide-more-evidence-controller';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { States } from '../../../app/data/states';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';

describe('Provide more evidence controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let updateAppealService: Partial<UpdateAppealService>;
  let documentManagementService: Partial<DocumentManagementService>;

  const file = {
    originalname: 'file.png',
    mimetype: 'type'
  };

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
    updateAppealService = {
      submitEventRefactored: sandbox.stub(),
      updateAppealService: sandbox.stub()
    } as Partial<UpdateAppealService>;
    documentManagementService = { deleteFile: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
    LaunchDarklyService.close();
  });

  describe('setupProvideMoreEvidenceController', () => {
    it('should setup routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const routerPostStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'post');
      const middleware: Middleware[] = [];

      setupProvideMoreEvidenceController(middleware, updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceForm);
      expect(routerPostStub).to.have.been.calledWith(paths.common.provideMoreEvidenceUploadFile);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceDeleteFile);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceCheck);
      expect(routerGetStub).to.have.been.calledWith(paths.common.provideMoreEvidenceConfirmation);
      expect(routerGetStub).to.have.been.calledWith(paths.common.yourEvidence);
      expect(routerGetStub).to.have.been.calledWith(paths.common.whyEvidenceLate);
      expect(routerPostStub).to.have.been.calledWith(paths.common.whyEvidenceLate);
    });
  });

  describe('getProvideMoreEvidence', () => {

    it('should render', () => {
      req.params.id = '1';
      getProvideMoreEvidence(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/multiple-evidence-upload-page.njk');
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getProvideMoreEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.called.calledWith(error);
    });
  });

  describe('getReasonForLateEvidence', () => {

    it('should redirect to \'/provide-more-evidence\' with error code, if no document is selected', () => {
      res.locals.errorCode = 'anError';
      req.session.appeal.appealStatus = States.DECIDED.id;
      getReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    });

    it('should render for addendum evidence', () => {
      req.params.id = '1';
      req.session.appeal.appealStatus = States.DECISION.id;
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      getReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/reason-for-late-evidence-page.njk');
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      req.session.appeal.appealStatus = States.DECISION.id;
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      const error = new Error('the error');
      res.render = sandbox.stub().throws(error);
      getReasonForLateEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postReasonForLateEvidence', () => {

    it('should redirect to \'/provide-more-evidence\' with error code, if no document is selected', () => {
      res.locals.errorCode = 'anError';
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.provideMoreEvidenceForm}?error=noFileSelected`);
    });

    it('should redirect to \'/why-evidence-late\' with error code, if no reason for late evidence is provided', () => {
      res.locals.errorCode = 'anError';
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(`${paths.common.whyEvidenceLate}?error=reasonForLateEvidence`);
    });

    it('should redirect to \'/provide-more-evidence-check\'', () => {
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.body.whyEvidenceLate = 'Reason for late evidence';
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.provideMoreEvidenceCheck);
    });

    it('should set addendum evidence description with reason for late evidence', () => {
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.body.whyEvidenceLate = 'Reason for late evidence';
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(req.session.appeal.addendumEvidence[0].description).to.equal('Reason for late evidence');
    });

    it('should catch error and call next with error', () => {
      req.params.id = '1';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      postReasonForLateEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('postProvideMoreEvidence', () => {

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;
      postProvideMoreEvidence(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('uploadProvideMoreEvidence', () => {

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'file.png'
      };
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);
      await uploadProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });

    it('should upload file when additional evidence', async () => {
      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Express.Multer.File;

      req.file = mockFile;
      req.session.appeal.appealStatus = States.APPEAL_SUBMITTED.id;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'name.png'
      };

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [documentMap];

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await uploadProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect((req.session.appeal.additionalEvidence || [])[0].fileId === documentUploadResponse.fileId);
      expect((req.session.appeal.additionalEvidence || [])[0].name === documentUploadResponse.name);
    });

    it('should upload file when addendum evidence and feature flag enabled', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false).resolves(true);
      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Express.Multer.File;

      req.file = mockFile;
      req.session.appeal.appealStatus = States.PRE_HEARING.id;

      const documentUploadResponse: DocumentUploadResponse = {
        fileId: 'someUUID',
        name: 'name.png'
      };

      const documentMap = { id: 'someUUID', url: 'docStoreURLToFile' };
      req.session.appeal.documentMap = [documentMap];

      documentManagementService.uploadFile = sandbox.stub().returns(documentUploadResponse);

      await uploadProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect((req.session.appeal.addendumEvidence || [])[0].fileId === documentUploadResponse.fileId);
      expect((req.session.appeal.addendumEvidence || [])[0].name === documentUploadResponse.name);
    });

    it('should redirect to appeal overview page when addendum evidence and feature flag disabled', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false).resolves(false);
      const fileSizeInMb = 0.001;
      const mockSizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const mockFile = {
        originalname: 'somefile.png',
        size: mockSizeInBytes
      } as Express.Multer.File;

      req.file = mockFile;
      req.session.appeal.appealStatus = States.PRE_HEARING.id;

      await uploadProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

  });

  describe('postProvideMoreEvidenceCheckAndSend', () => {
    it('should redirect to provide-more-evidence confirmation page when additional evidence', async () => {
      req.session.appeal.appealStatus = States.APPEAL_SUBMITTED.id;
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      await postProvideMoreEvidenceCheckAndSend(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.provideMoreEvidenceConfirmation);
    });

    it('should redirect to provide-more-evidence confirmation page when addendum evidence and feature flag enabled', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false).resolves(true);
      req.session.appeal.appealStatus = States.PRE_HEARING.id;
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      await postProvideMoreEvidenceCheckAndSend(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.provideMoreEvidenceConfirmation);
    });

    it('should redirect to appeal overview page when addendum evidence and feature flag disabled', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.UPLOAD_ADDENDUM_EVIDENCE, false).resolves(false);
      req.session.appeal.appealStatus = States.PRE_HEARING.id;
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      await postProvideMoreEvidenceCheckAndSend(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.calledWith(paths.common.overview);
    });

    it('should catch an error and redirect with error', async () => {
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);
      const file = {
        originalname: 'file.png',
        mimetype: 'type'
      };
      req.file = file as Express.Multer.File;

      await postProvideMoreEvidenceCheckAndSend(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('deleteProvideMoreEvidence', () => {
    it('should delete an additional document', async () => {
      const deleteEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: '1', url: 'docStoreURLToFile' };
      req.session.appeal.additionalEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.session.appeal.documentMap = [{ ...documentMap }];
      req.query.id = '1';
      const appeal: Appeal = { ...req.session.appeal };

      await deleteProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(req.session.appeal.additionalEvidence.length).to.eq(0);
      expect(req.session.appeal.documentMap.length).to.eq(0);
    });

    it('should delete an addendum document', async () => {
      const deleteEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: '1', url: 'docStoreURLToFile' };
      req.session.appeal.appealStatus = States.DECIDED.id;
      req.session.appeal.addendumEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.session.appeal.documentMap = [{ ...documentMap }];
      req.query.id = '1';
      const appeal: Appeal = { ...req.session.appeal };

      await deleteProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(req.session.appeal.addendumEvidence.length).to.eq(0);
      expect(req.session.appeal.documentMap.length).to.eq(0);
    });

    it('should not delete any document if no query id', async () => {
      const deleteEvidence: Evidence = {
        fileId: 'fileId',
        name: 'theFileName'
      };
      const documentMap: DocumentMap = { id: '1', url: 'docStoreURLToFile' };
      req.session.appeal.additionalEvidence = [{ fileId: '1', name: 'name' } as AdditionalEvidenceDocument];
      req.session.appeal.documentMap = [{ ...documentMap }];
      const appeal: Appeal = { ...req.session.appeal };

      await deleteProvideMoreEvidence(updateAppealService as UpdateAppealService, documentManagementService as DocumentManagementService)(req as Request, res as Response, next);

      expect(req.session.appeal.additionalEvidence.length).to.eq(1);
      expect(req.session.appeal.documentMap.length).to.eq(1);
      expect(res.redirect).to.have.been.calledWith(paths.common.provideMoreEvidenceForm);
    });
  });

  describe('getConfirmation', () => {
    it('should render', () => {
      getConfirmation(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk');
    });

    it('should render for updload addendum evidence', () => {
      req.session.appeal.appealStatus = States.PRE_HEARING.id;
      getConfirmation(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/confirmation-page.njk');
    });
  });

  describe('getAdditionalEvidenceDocuments', () => {
    it('should render when additional evidence', () => {
      const summaryList: SummaryList[] = [{ summaryRows: [] }];
      req.session.appeal.additionalEvidenceDocuments = [];
      getAdditionalEvidenceDocuments(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/check-and-send.njk', {
        pageTitle: i18n.pages.provideMoreEvidence.yourEvidence.title,
        previousPage: paths.common.overview,
        summaryLists: summaryList
      });
    });
  });

  describe('getLrAdditionalEvidenceDocuments', () => {
    it('should render when additional evidence by Legal Reap', () => {
      const summaryList: SummaryList[] = [{ summaryRows: [] }];
      req.session.appeal.additionalEvidenceDocuments = [];
      getLrAdditionalEvidenceDocuments(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/addendum-evidence-detail-page.njk', {
        pageTitle: i18n.pages.provideMoreEvidence.yourEvidence.title,
        description: i18n.pages.provideMoreEvidence.yourEvidence.description,
        previousPage: paths.common.overview,
        summaryLists: summaryList
      });
    });
  });

  describe('getAddendumEvidenceDocuments', () => {
    it('should render when addendum evidence', () => {
      const summaryList: SummaryList[] = [{ summaryRows: [] }];
      req.session.appeal.addendumEvidenceDocuments = [];
      getAddendumEvidenceDocuments(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/addendum-evidence-detail-page.njk', {
        pageTitle: i18n.pages.provideMoreEvidence.newEvidence.title,
        description: i18n.pages.provideMoreEvidence.newEvidence.description,
        previousPage: paths.common.overview,
        summaryLists: summaryList
      });
    });
  });

  describe('getAppellantAddendumEvidenceDocuments', () => {
    it('should render when addendum evidence', () => {
      const summaryList: SummaryList[] = [{ summaryRows: [] }];
      req.session.appeal.addendumEvidenceDocuments = [];
      getAppellantAddendumEvidenceDocuments(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/addendum-evidence-detail-page.njk', {
        pageTitle: i18n.pages.provideMoreEvidence.yourAddendumEvidence.title,
        description: i18n.pages.provideMoreEvidence.yourAddendumEvidence.description,
        previousPage: paths.common.overview,
        summaryLists: summaryList
      });
    });
  });

  describe('getUploadedAddendumEvidenceDocuments', () => {
    it('should return addendum evidence uploaded by the TCW', () => {
      req.session.appeal.addendumEvidenceDocuments = [
        {
          id: 'id1',
          name: 'fileName',
          fileId: 'aFile',
          uploadedBy: 'TCW'
        }
      ];
      const docs: Evidence[] = getUploadedAddendumEvidenceDocuments(req as Request, 'TCW');

      expect(docs).to.be.lengthOf(1);
    });

    it('should return addendum evidence uploaded by the Appellant', () => {
      req.session.appeal.addendumEvidenceDocuments = [
        {
          id: 'id1',
          name: 'fileName',
          fileId: 'aFile',
          suppliedBy: 'The appellant'
        }
      ];
      const docs: Evidence[] = getUploadedAddendumEvidenceDocuments(req as Request, 'Appellant');

      expect(docs).to.be.lengthOf(1);
    });

    it('should return addendum evidence uploaded by the Respondent', () => {
      req.session.appeal.addendumEvidenceDocuments = [
        {
          id: 'id1',
          name: 'fileName',
          fileId: 'aFile',
          suppliedBy: 'The respondent'
        }
      ];
      const docs: Evidence[] = getUploadedAddendumEvidenceDocuments(req as Request, 'Respondent');

      expect(docs).to.be.lengthOf(1);
    });

    it('should return empty list', () => {
      req.session.appeal.addendumEvidenceDocuments = [
        {
          id: 'id1',
          name: 'fileName',
          fileId: 'aFile',
          suppliedBy: 'suppliedBy'
        }
      ];
      const docs: Evidence[] = getUploadedAddendumEvidenceDocuments(req as Request, 'uploadedBy');

      expect(docs).to.be.empty;
    });
  });

  describe('getHomeOfficeEvidenceDocuments', () => {
    it('should render', () => {
      const summaryList: SummaryList[] = [{ summaryRows: [] }];
      req.session.appeal.addendumEvidenceDocuments = [];
      getHomeOfficeEvidenceDocuments(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('upload-evidence/addendum-evidence-detail-page.njk', {
        pageTitle: i18n.pages.provideMoreEvidence.homeOfficeEvidence.title,
        description: i18n.pages.provideMoreEvidence.homeOfficeEvidence.description,
        previousPage: paths.common.overview,
        summaryLists: summaryList
      });
    });
  });

  describe('buildAdditionalEvidenceDocumentsSummaryList', () => {

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
                    'href': 'provide-more-evidence',
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

      const result = buildAdditionalEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
    });

    it('should return additional document list', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName'
        }
      ];

      const result = buildAdditionalEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows).to.be.lengthOf(1);
    });

    it('should return empty list', () => {
      const mockEvidenceDocuments: Evidence[] = [];

      const result = buildAdditionalEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows).to.be.empty;
    });
  });

  describe('buildAddendumEvidenceDocumentsSummaryList', () => {

    it('should build a list in correct format for late evidence', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'aFileName',
          description: 'Reason for late evidence'
        },
        {
          fileId: 'bFileId',
          name: 'bFileName',
          description: 'Reason for late evidence'
        },
        {
          fileId: 'cFileId',
          name: 'cFileName',
          description: 'Reason for late evidence'
        }
      ];

      const expectedSummaryList: SummaryList[] = [
        {
          'summaryRows': [
            {
              'actions': {
                'items': [
                  {
                    'href': 'provide-more-evidence',
                    'text': 'Change'
                  }
                ]
              },
              'key': {
                'text': 'Supporting evidence'
              },
              'value': {
                'html': '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/aFileId\'>aFileName</a>'
              }
            },
            {
              'actions': {
                'items': [
                  {
                    'href': 'why-evidence-late',
                    'text': 'Change'
                  }
                ]
              },
              'key': {
                'text': 'Reason evidence is late'
              },
              'value': {
                'html': '<p>Reason for late evidence</p>'
              }
            }
          ]
        }
      ];

      const result = buildAddendumEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
      expect(result[0].summaryRows[result[0].summaryRows.length - 1].key.text).to.equal(expectedSummaryList[0].summaryRows[1].key.text);
      expect(result[0].summaryRows[result[0].summaryRows.length - 1].value.html).to.equal(expectedSummaryList[0].summaryRows[1].value.html);
    });

    it('should return addendum document list', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName',
          description: 'description'
        }
      ];

      const result = buildAddendumEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result).to.be.lengthOf(1);
    });

    it('should return empty list', () => {
      const mockEvidenceDocuments: Evidence[] = [];

      const result = buildAddendumEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result).to.be.empty;
    });
  });

  describe('buildUploadedAdditionalEvidenceDocumentsSummaryList', () => {

    it('should build a list in correct format', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName',
          dateUploaded: 'dateUploaded'
        }
      ];

      const expectedSummaryList: SummaryList[] = [
        {
          'summaryRows': [
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Date uploaded'
              },
              'value': {
                'html': '<p>dateUploaded</p>'
              }
            },
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Document'
              },
              'value': {
                'html': '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/aFileId\'>fileName</a>'
              }
            }
          ]
        }
      ];

      const result = buildUploadedAdditionalEvidenceDocumentsSummaryList(mockEvidenceDocuments, false);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
    });

    it('should build a list in correct format for legal rep additional evidence', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName',
          dateUploaded: 'dateUploaded',
          description: 'description'
        }
      ];

      const expectedSummaryList: SummaryList[] = [
        {
          'summaryRows': [
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Date uploaded'
              },
              'value': {
                'html': '<p>dateUploaded</p>'
              }
            },
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Document'
              },
              'value': {
                'html': '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/aFileId\'>fileName</a>'
              }
            },
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Reason for uploading evidence'
              },
              'value': {
                'html': '<p>description</p>'
              }
            }
          ]
        }
      ];

      const result = buildUploadedAdditionalEvidenceDocumentsSummaryList(mockEvidenceDocuments, true);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
      expect(result[0].summaryRows[2].key.text).to.equal(expectedSummaryList[0].summaryRows[2].key.text);
      expect(result[0].summaryRows[2].value.html).to.equal(expectedSummaryList[0].summaryRows[2].value.html);
    });
  });

  describe('buildUploadedAddendumEvidenceDocumentsSummaryList', () => {

    it('should build a list in correct format', () => {
      const mockEvidenceDocuments: Evidence[] = [
        {
          fileId: 'aFileId',
          name: 'fileName',
          dateUploaded: 'dateUploaded',
          description: 'description'
        }
      ];

      const expectedSummaryList: SummaryList[] = [
        {
          'summaryRows': [
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Date uploaded'
              },
              'value': {
                'html': '<p>dateUploaded</p>'
              }
            },
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Document'
              },
              'value': {
                'html': '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/aFileId\'>fileName</a>'
              }
            },
            {
              'actions': {
                'items': []
              },
              'key': {
                'text': 'Reason evidence is late'
              },
              'value': {
                'html': '<p>description</p>'
              }
            }
          ]
        }
      ];

      const result = buildUploadedAddendumEvidenceDocumentsSummaryList(mockEvidenceDocuments);

      expect(result[0].summaryRows[0].key.text).to.equal(expectedSummaryList[0].summaryRows[0].key.text);
      expect(result[0].summaryRows[0].value.html).to.equal(expectedSummaryList[0].summaryRows[0].value.html);
      expect(result[0].summaryRows[2].key.text).to.equal(expectedSummaryList[0].summaryRows[2].key.text);
      expect(result[0].summaryRows[2].value.html).to.equal(expectedSummaryList[0].summaryRows[2].value.html);
    });
  });

  describe('validate', function () {
    it('should call next if no multer errors', () => {
      validate(paths.common.provideMoreEvidenceForm)(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

    it('should redirect to \'/provide-more-evidence\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(paths.common.provideMoreEvidenceForm)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should redirect to \'/why-evidence-late\' with error code', async () => {
      res.locals.errorCode = 'anError';
      validate(paths.common.whyEvidenceLate)(req as Request, res as Response, next);

      expect(res.redirect).to.have.been.called;
    });

    it('should catch error and call next with error', async () => {
      res.locals.errorCode = 'anError';
      const error = new Error('the error');
      res.redirect = sandbox.stub().throws(error);

      validate(paths.common.provideMoreEvidenceForm)(req as Request, res as Response, next);

      expect(next).to.have.been.calledWith(error);
    });
  });
});
