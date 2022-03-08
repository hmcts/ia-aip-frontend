import { NextFunction, Request, Response } from 'express';
import {
  getAppealDetailsViewer,
  getCmaRequirementsViewer,
  getDecisionAndReasonsViewer,
  getDocumentViewer,
  getHearingBundle,
  getHearingNoticeViewer,
  getHoEvidenceDetailsViewer,
  getHomeOfficeResponse,
  getHomeOfficeWithdrawLetter,
  getNoticeEndedAppeal,
  getOutOfTimeDecisionViewer,
  getReasonsForAppealViewer,
  getTimeExtensionSummaryRows,
  getTimeExtensionViewer,
  setupCmaRequirementsViewer,
  setupDetailViewersController
} from '../../../app/controllers/detail-viewers';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import Logger from '../../../app/utils/logger';
import * as summaryUtils from '../../../app/utils/summary-list';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';
import { expectedEventsWithCmaRequirements } from '../mockData/events/expectation/expected-history-cma-requirements';

const express = require('express');

describe('Detail viewer Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let documentManagementService: Partial<DocumentManagementService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      params: {},
      session: {
        appeal: {
          cmaRequirements: {
            otherNeeds: {
              bringOwnMultimediaEquipment: false
            }
          },
          application: {
          }
        }
      } as Partial<Express.Session>,
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

    documentManagementService = { fetchFile: sandbox.stub() };

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      setHeader: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDetailViewersController', () => {
    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router, 'get');

      setupDetailViewersController(documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.common.documentViewer + '/:documentId');
      expect(routerGetStub).to.have.been.calledWith(paths.common.homeOfficeWithdrawLetter);
      expect(routerGetStub).to.have.been.calledWith(paths.common.appealDetailsViewer);
      expect(routerGetStub).to.have.been.calledWith(paths.common.reasonsForAppealViewer);
      expect(routerGetStub).to.have.been.calledWith(paths.common.timeExtensionViewer + '/:id');
      expect(routerGetStub).to.have.been.calledWith(paths.common.cmaRequirementsAnswerViewer);
      expect(routerGetStub).to.have.been.calledWith(paths.common.homeOfficeWithdrawLetter);
    });
  });

  describe('getHoEvidenceDetailsViewer', () => {
    it('should render detail-viewers/view-ho-details.njk with no documents', () => {

      getHoEvidenceDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('detail-viewers/view-ho-details.njk', {
        documents: [],
        previousPage: paths.common.overview
      });
    });

    it('should render detail-viewers/view-ho-details.njk with documents', () => {

      req.session.appeal.respondentDocuments = [
        {
          dateUploaded: '2020-02-21',
          fileId: 'someUUID',
          name: 'evidence_file.png'
        }
      ];

      getHoEvidenceDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('detail-viewers/view-ho-details.njk', {
        documents: [{
          dateUploaded: '21 February 2020',
          url: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/someUUID'>evidence_file(PNG)</a>"
        }],
        previousPage: paths.common.overview
      });
    });

    it('getHoEvidenceDetailsViewer should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHoEvidenceDetailsViewer(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHomeOfficeWithdrawLetter', () => {
    beforeEach(() => {
      req.session.appeal.respondentDocuments = [
        {
          fileId: 'uuid',
          name: 'filename',
          description: 'description here',
          dateUploaded: '2020-02-21',
          id: '2',
          tag: 'appealResponse'
        }
      ];
    });
    it('should render details-viewer template', () => {
      getHomeOfficeWithdrawLetter(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.homeOfficeWithdrawLetter.title,
        data: sinon.match.array,
        previousPage: paths.common.overview
      });
    });

    it('should render details-viewer template with additional evidences', () => {
      req.session.appeal.respondentDocuments.push({
        fileId: 'uuid',
        name: 'filename',
        description: 'description here',
        dateUploaded: '2020-02-21',
        id: '2',
        tag: 'appealResponse'
      });
      getHomeOfficeWithdrawLetter(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.homeOfficeWithdrawLetter.title,
        data: sinon.match.array,
        previousPage: paths.common.overview
      });
    });

    it('getHoEvidenceDetailsViewer should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHomeOfficeWithdrawLetter(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHomeOfficeResponse', () => {
    beforeEach(() => {
      req.session.appeal.respondentDocuments = [
        {
          fileId: 'uuid',
          name: 'filename',
          description: 'description here',
          dateUploaded: '2020-02-21',
          id: '2',
          tag: 'appealResponse'
        }
      ];
    });
    it('should render details-viewer template', () => {
      getHomeOfficeResponse(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.homeOfficeResponse.title,
        data: sinon.match.array,
        previousPage: paths.common.overview
      });
    });

    it('should render details-viewer template with additional evidences', () => {
      req.session.appeal.respondentDocuments.push({
        fileId: 'uuid',
        name: 'filename',
        description: 'description here',
        dateUploaded: '2020-02-21',
        id: '2',
        tag: 'appealResponse'
      });
      getHomeOfficeResponse(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.homeOfficeResponse.title,
        data: sinon.match.array,
        previousPage: paths.common.overview
      });
    });

    it('getHoEvidenceDetailsViewer should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHomeOfficeResponse(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getDocumentViewer', () => {
    it('should display file', async () => {
      req.params.documentId = '1';
      req.session.appeal.documentMap = [{ id: '1', url: 'documentStoreUrl' }];

      const fetchResponse = {
        headers: { 'content-type': 'image/png' },
        statusCode: 200,
        body: 'someBinaryContent'
      };

      documentManagementService.fetchFile = sandbox.stub().returns(fetchResponse);
      const expectedBuffer = Buffer.from(fetchResponse.body, 'binary');
      await getDocumentViewer(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(res.setHeader).to.have.been.calledOnceWith('content-type', 'image/png');
      expect(res.send).to.have.been.calledOnceWith(expectedBuffer);
    });

    it('getDocumentViewer should catch exception and call next with the error', async () => {
      req.params.documentId = '1';
      req.session.appeal.documentMap = [{ id: '1', url: 'documentStoreUrl' }];
      const error = new Error('an error');
      documentManagementService.fetchFile = sandbox.stub().throws(error);
      await getDocumentViewer(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getReasonsForAppealViewer', () => {
    it('should render detail-viewers/reasons-for-appeal-details-viewer.njk', () => {

      req.session.appeal.reasonsForAppeal = {
        'applicationReason': 'HELLO',
        'evidences': [
          {
            'fileId': '00000',
            'name': 'test.txt',
            'dateUploaded': '2021-07-26+01:00',
            'description': 'Appeal Reasons supporting evidence'
          }
        ]
      };

      req.session.appeal.documentMap = [{
        id: '00000',
        url: 'http://dm-store:4506/documents/3867d40b-f1eb-477b-af49-b9a03bc27641'
      }, {
        id: '00001',
        url: 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192'
      }];

      const expectedSummaryRows = [{
        'key': { 'text': 'Why do you think the Home Office decision is wrong?' },
        'value': { 'html': 'HELLO' }
      }, {
        'key': { 'text': 'Supporting evidence' },
        'value': { 'html': "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/00000'>test.txt</a>" }
      }];
      getReasonsForAppealViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/reasons-for-appeal-details-viewer.njk', {
        previousPage: paths.common.overview,
        data: expectedSummaryRows
      });
    });

    it('getReasonsForAppealViewer should catch exception and call next with the error', () => {

      req.session.appeal.reasonsForAppeal = {
        'applicationReason': 'HELLO',
        'evidences': [
          {
            'fileId': 'dfa20ad2-4e5b-4f68-9df7-ad564c324e47',
            'name': 'test.txt',
            'dateUploaded': '2021-07-26+01:00',
            'description': 'Appeal Reasons supporting evidence'
          }
        ]
      };
      req.session.appeal.documentMap = [{
        id: '00000',
        url: 'http://dm-store:4506/documents/3867d40b-f1eb-477b-af49-b9a03bc27641'
      }, {
        id: '00001',
        url: 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192'
      }];

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getReasonsForAppealViewer(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getAppealDetailsViewer', () => {
    let expectedSummaryRows;

    beforeEach(() => {
      req.session.appeal = {
        ccdCaseId: '1623767014596745',
        appealStatus: 'appealSubmitted',
        appealCreatedDate: '2021-06-15T14:23:34.581353',
        appealLastModified: '2021-06-15T14:40:04.384479',
        appealReferenceNumber: 'PA/50008/2021',
        application: {
          homeOfficeRefNumber: 'A1234567',
          appellantInUk: 'No',
          outsideUkWhenApplicationMade: 'No',
          gwfReferenceNumber: '',
          dateClientLeaveUk: {
            year: '2022',
            month: '2',
            day: '19'
          },
          appealType: 'protection',
          contactDetails: {
            email: 'test@email.com',
            wantsEmail: true,
            phone: '7759991234',
            wantsSms: true
          },
          dateLetterSent: {
            year: '2020',
            month: '2',
            day: '16'
          },
          decisionLetterReceivedDate: {
            year: '2020',
            month: '2',
            day: '16'
          },
          isAppealLate: true,
          lateAppeal: {
            reason: 'a reason for being late',
            evidence: {
              fileId: '318c373c-dd10-4deb-9590-04282653715d',
              name: 'MINI-UK-66-reg.jpg'
            }
          },
          personalDetails: {
            givenNames: 'Pablo',
            familyName: 'Ramirez',
            dob: {
              year: '1988',
              month: '07',
              day: '20'
            },
            nationality: 'AL',
            address: {
              line1: '60 GREAT PORTLAND STREET',
              line2: '',
              city: 'LONDON',
              county: 'United Kingdom',
              postcode: 'W1W 7RT'
            }
          }
        },
        legalRepresentativeDocuments: [
          {
            fileId: '9e33677f-92cf-4b72-b183-ce09ee72aafd',
            name: 'PA 50008 2021-Ramirez-appeal-form.PDF',
            id: '3',
            tag: 'appealSubmission',
            dateUploaded: '2021-06-15'
          },
          {
            fileId: 'f1d73cba-a117-4a0c-acf3-d8b787c984d7',
            name: 'unnamed.jpg',
            id: '2',
            tag: 'homeOfficeDecisionLetter',
            dateUploaded: '2021-06-15'
          },
          {
            fileId: '3d8bf49d-766f-4f41-b814-e82a04dec002',
            name: 'Screenshot 2021-06-10 at 13.01.57.png',
            id: '1',
            tag: 'homeOfficeDecisionLetter',
            dateUploaded: '2021-06-15'
          }
        ],
        hearingDocuments: [
          {
            fileId: '3d8bf49d-dc3e-412a-b814-19dbe4180ac2',
            name: 'PA 50001 2022-User-hearing-bundle.pdf',
            id: '1',
            tag: 'hearingBundle',
            dateUploaded: '2021-06-15'
          }
        ],
        documentMap: [
          {
            id: '318c373c-dd10-4deb-9590-04282653715d',
            url: 'http://dm-store:8080/documents/c69d78f4-e9cb-48b6-8d13-1e566d2d1e5c'
          },
          {
            id: '9e33677f-92cf-4b72-b183-ce09ee72aafd',
            url: 'http://dm-store:8080/documents/8fa0f52e-4760-4ee3-9d4e-f38b9cd37a42'
          },
          {
            id: 'f1d73cba-a117-4a0c-acf3-d8b787c984d7',
            url: 'http://dm-store:8080/documents/3cae9ca9-b0fc-4eff-ab9d-2772187f5474'
          },
          {
            id: '3d8bf49d-766f-4f41-b814-e82a04dec002',
            url: 'http://dm-store:8080/documents/a9e25073-b9a3-4af6-a586-ae3b2444b850'
          }
        ]
      };

      expectedSummaryRows = [
        { key: { text: 'Home Office reference number' }, value: { html: 'A1234567' } },
        { key: { text: 'Date letter sent' }, value: { html: '16 February 2020' } },
        { key: { text: 'Home Office decision letter' }, value: { html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/f1d73cba-a117-4a0c-acf3-d8b787c984d7'>unnamed.jpg</a><br><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/3d8bf49d-766f-4f41-b814-e82a04dec002'>Screenshot 2021-06-10 at 13.01.57.png</a>" } },
        { key: { text: 'Name' }, value: { html: 'Pablo Ramirez' } },
        { key: { text: 'Date of birth' }, value: { html: '20 July 1988' } },
        { key: { text: 'Nationality' }, value: { html: 'Albania' } },
        { key: { text: 'Address' }, value: { html: '60 GREAT PORTLAND STREET<br>LONDON<br>United Kingdom<br>W1W 7RT' } },
        { key: { text: 'Contact details' }, value: { html: 'test@email.com<br>7759991234' } },
        { key: { text: 'Appeal type' }, value: { html: 'Protection' } },
        { key: { text: 'Reason for late appeal' }, value: { html: 'a reason for being late' } },
        { key: { text: 'Supporting evidence' }, value: { html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/318c373c-dd10-4deb-9590-04282653715d'>MINI-UK-66-reg.jpg</a>" } }
      ];
    });

    it('should render detail-viewers/appeal-details-viewer.njk', async () => {
      await getAppealDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.appealDetails.title,
        previousPage: paths.common.overview,
        data: expectedSummaryRows
      });
    });

    it('should render detail-viewers/appeal-details-viewer.njk payments NOW flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      expectedSummaryRows.push(
        { key: { text: 'Decision Type' }, value: { html: 'Decision with a hearing' } },
        { key: { text: 'Fee amount' }, value: { html: '£140' } }
      );

      req.session.appeal.paAppealTypeAipPaymentOption = 'payNow';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      req.session.appeal.feeWithHearing = '140';

      await getAppealDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.appealDetails.title,
        previousPage: paths.common.overview,
        data: expectedSummaryRows
      });
    });

    it('should render detail-viewers/appeal-details-viewer.njk payments LATER flag ON', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      expectedSummaryRows.push(
        { key: { text: 'Decision Type' }, value: { html: 'Decision with a hearing' } },
        { key: { text: 'Payment type' }, value: { html: 'Pay later' } }
      );

      req.session.appeal.paAppealTypeAipPaymentOption = 'payLater';
      req.session.appeal.application.decisionHearingFeeOption = 'decisionWithHearing';
      req.session.appeal.feeWithHearing = '140';

      await getAppealDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.appealDetails.title,
        previousPage: paths.common.overview,
        data: expectedSummaryRows
      });
    });

    it('should render detail-viewers/appeal-details-viewer.njk deprivation appeal type, payments flag ON @detailsViewer', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
      expectedSummaryRows[8].value.html = 'Deprivation of Citizenship';
      expectedSummaryRows.push(
        { key: { text: 'Decision Type' }, value: { html: 'Decision with a hearing' } }
      );
      req.session.appeal.application.appealType = 'deprivation';
      req.session.appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';

      await getAppealDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.appealDetails.title,
        previousPage: paths.common.overview,
        data: expectedSummaryRows
      });
    });

    it('should catch exception and call next with the error', async () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await getAppealDetailsViewer(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getTimeExtensionViewer', () => {
    it('should render detail-viewers/time-extension-details-viewer.njk with no evidences', () => {
      const timeExtension: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2021-07-15',
          'type': 'Time extension',
          'state': 'awaitingReasonsForAppeal',
          'details': 'My reason',
          'decision': 'Pending',
          'evidence': [],
          'applicant': 'Appellant',
          'applicantRole': 'citizen'
        }
      };
      req.params.id = '1';
      req.session.appeal.hearing = {
        hearingCentre: '',
        date: '',
        time: ''
      },
        req.session.appeal.hearingCentre = 'taylorHouse';
      req.session.appeal.makeAnApplications = [timeExtension];
      req.session.appeal.makeAnApplicationEvidence = [{
        id: 'id',
        fileId: '123456',
        name: 'name',
        tag: 'test-tag',
        suppliedBy: 'test-supplied',
        description: 'test-description',
        dateUploaded: 'test-date'
      }];
      getTimeExtensionViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/time-extension-details-viewer.njk', {
        previousPage: paths.common.overview,
        timeExtension,
        request: sinon.match.any,
        response: sinon.match.any,
        hearingCentreEmail: 'IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL'
      });
    });
  });

  describe('getHearingBundle', () => {
    beforeEach(() => {
      req.session.appeal.hearingDocuments = [
        {
          fileId: 'uuid',
          name: 'filename',
          description: 'description here',
          dateUploaded: '2020-02-21',
          id: '2',
          tag: 'hearingBundle'
        }
      ];
    });
    it('should render details-viewer template', () => {
      getHearingBundle(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.hearingBundle.title,
        data: sinon.match.array,
        previousPage: paths.common.overview
      });
    });

    it('getHearingBundle should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHearingBundle(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getHearingBundle', () => {
    beforeEach(() => {
      req.session.appeal.hearingDocuments = [
        {
          fileId: 'uuid',
          name: 'filename',
          description: 'description here',
          dateUploaded: '2020-02-21',
          id: '2',
          tag: 'hearingBundle'
        }
      ];
    });
    it('should render details-viewer template', () => {
      getHearingBundle(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.hearingBundle.title,
        data: sinon.match.array,
        previousPage: paths.common.overview
      });
    });

    it('getHearingBundle should catch exception and call next with the error', () => {
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getHearingBundle(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getNoticeEndedAppeal @getNotice', () => {
    const document = {
      fileId: 'a3d396eb-277d-4b66-81c8-627f57212ec8',
      name: 'PA 50002 2021-perez-NoticeOfEndedAppeal.PDF',
      id: '1',
      tag: 'endAppeal',
      dateUploaded: '2021-06-01'
    };
    it('should render templates/details-viewer.njk with ended appeal notice document', () => {
      req.session.appeal.tribunalDocuments = [document];
      const expectedSummaryRows = [
        {
          key: { text: i18n.pages.detailViewers.common.dateUploaded },
          value: { html: '01 June 2021' }
        },
        {
          key: { text: i18n.pages.detailViewers.common.document },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/${document.fileId}'>PA 50002 2021-perez-NoticeOfEndedAppeal(PDF)</a>` }
        }];

      getNoticeEndedAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.endedAppeal.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should catch error and call next with it', () => {
      req.session.appeal.tribunalDocuments = [document];
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getNoticeEndedAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('should render notice of hearing', () => {
    const document = {
      fileId: 'a3d396eb-277d-4b66-81c8-627f57212ec8',
      name: 'PA 50002 2021-perez-hearing-notice.PDF',
      id: '1',
      tag: 'hearingNotice',
      dateUploaded: '2021-06-01'
    };
    it('should render templates/details-viewer.njk with hearing notice document', () => {
      req.session.appeal.hearingDocuments = [document];
      const expectedSummaryRows = [
        {
          key: { text: i18n.pages.detailViewers.common.dateUploaded },
          value: { html: '01 June 2021' }
        },
        {
          key: { text: i18n.pages.detailViewers.common.document },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/${document.fileId}'>PA 50002 2021-perez-hearing-notice(PDF)</a>` }
        }];

      getHearingNoticeViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.hearingNotice.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });

      it('should catch error and call next with it', () => {
        req.session.appeal.hearingDocuments = [document];
        const error = new Error('an error');
        res.render = sandbox.stub().throws(error);

        getHearingNoticeViewer(req as Request, res as Response, next);
        expect(next).to.have.been.calledWith(error);
      });
    });
  });

  describe('should render final decision and reasons documents', () => {
    const documents = [
      {
        fileId: '976fa409-4aab-40a4-a3f9-0c918f7293c8',
        name: 'PA 50012 2022-bond20-Decision-and-reasons-FINAL.pdf',
        id: '2',
        tag: 'finalDecisionAndReasonsPdf',
        dateUploaded: '2022-01-26'
      },
      {
        fileId: '723e6179-9a9d-47d9-9c76-80ccc23917db',
        name: 'PA 50012 2022-bond20-Decision-and-reasons-Cover-letter.PDF',
        id: '1',
        tag: 'decisionAndReasonsCoverLetter',
        dateUploaded: '2022-01-26'
      }
    ];
    it('should render templates/details-viewer.njk with final decision and reasons documents', () => {
      req.session.appeal.finalDecisionAndReasonsDocuments = documents;
      const expectedSummaryRows = [
        {
          key: { text: i18n.pages.detailViewers.common.dateUploaded },
          value: { html: '26 January 2022' }
        },
        {
          key: { text: i18n.pages.detailViewers.common.document },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/723e6179-9a9d-47d9-9c76-80ccc23917db'>PA 50012 2022-bond20-Decision-and-reasons-Cover-letter(PDF)</a>` }
        },
        {
          key: { text: i18n.pages.detailViewers.common.dateUploaded },
          value: { html: '26 January 2022' }
        },
        {
          key: { text: i18n.pages.detailViewers.common.document },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>PA 50012 2022-bond20-Decision-and-reasons-FINAL(PDF)</a>` }
        }
      ];

      getDecisionAndReasonsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.decisionsAndReasons.title,
        description: i18n.pages.detailViewers.decisionsAndReasons.description,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });

      it('should catch error and call next with it', () => {
        req.session.appeal.finalDecisionAndReasonsDocuments = documents;
        const error = new Error('an error');
        res.render = sandbox.stub().throws(error);

        getDecisionAndReasonsViewer(req as Request, res as Response, next);
        expect(next).to.have.been.calledWith(error);
      });
    });
  });

  describe('getTimeExtensionSummaryRows', () => {
    it('should get rows', () => {
      const addSummaryRowStub = sandbox.stub(summaryUtils, 'addSummaryRow');
      const timeExtensionPendingDecision: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2021-07-15',
          'type': 'Time extension',
          'state': 'awaitingReasonsForAppeal',
          'details': 'My reason',
          'decision': 'Pending',
          'evidence': [{
            id: 'id',
            fileId: '123456',
            name: 'name',
            tag: 'test-tag',
            suppliedBy: 'test-supplied',
            description: 'test-description',
            dateUploaded: 'test-date'
          }],
          'applicant': 'Appellant',
          'applicantRole': 'citizen'
        }
      };

      getTimeExtensionSummaryRows(timeExtensionPendingDecision);
      expect(addSummaryRowStub).to.have.been.callCount(4);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.request.whatYouAskedFor, [i18n.pages.detailViewers.timeExtension.request.wantMoreTime]);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.request.reason, ['My reason']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.request.date, ['15 July 2021']);
    });

    it('should get rows with decision', () => {
      const addSummaryRowStub = sandbox.stub(summaryUtils, 'addSummaryRow');
      const timeExtensionPendingDecision = {
        'id': '2',
        'value': {
          'date': '2021-07-14',
          'type': 'Time extension',
          'state': 'awaitingReasonsForAppeal',
          'details': 'My reason',
          'decision': 'Refused',
          'evidence': [{
            id: 'id',
            fileId: '123456',
            name: 'name',
            tag: 'test-tag',
            suppliedBy: 'test-supplied',
            description: 'test-description',
            dateUploaded: 'test-date'
          }],
          'applicant': 'Appellant',
          'decisionDate': '2021-07-14',

          'applicantRole': 'citizen',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Reason not enough'
        }
      };

      getTimeExtensionSummaryRows(timeExtensionPendingDecision);
      expect(addSummaryRowStub).to.have.been.callCount(8);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.request.whatYouAskedFor, [i18n.pages.detailViewers.timeExtension.request.wantMoreTime]);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.request.reason, ['My reason']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.request.date, ['14 July 2021']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.response.decision, [i18n.pages.detailViewers.timeExtension.response.Refused]);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.response.reason, ['Reason not enough']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.response.date, ['14 July 2021']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.timeExtension.response.maker, ['Tribunal Caseworker']);
    });
  });

  describe('getOutOfTimeDecisionViewer', () => {
    const document = {
      fileId: 'a3d396eb-277d-4b66-81c8-627f57212ec8',
      name: 'PA 50002 2021-perez-NoticeOfEndedAppeal.PDF',
      id: '1',
      tag: 'recordOutOfTimeDecisionDocument',
      dateUploaded: '2021-06-01'
    };
    it('should render details-viewer.njk template', () => {
      req.session.appeal.tribunalDocuments = [document];
      getOutOfTimeDecisionViewer(req as Request, res as Response, next);

      expect(res.render).to.have.been.called;
    });

    it('should catch error', () => {
      req.session.appeal.tribunalDocuments = [document];
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getOutOfTimeDecisionViewer(req as Request, res as Response, next);

      expect(next).to.have.been.called;
    });

  });

  describe('getCmaDetailsViewer', () => {
    it('should render detail-viewers/cma-requirements-viewer.njk with no evidences', () => {
      req.session.appeal.history = expectedEventsWithCmaRequirements;

      getCmaRequirementsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/cma-requirements-details-viewer.njk', {
        anythingElse: [{
          key: { text: 'Question' },
          value: { html: 'Will you need anything else at the appointment?' }
        }, { key: { text: 'Answer' }, value: { html: 'Yes' } }, {
          key: { text: 'Question' },
          value: { html: 'Tell us what you will need and why you need it' }
        }, { key: { text: 'Answer' }, value: { html: '' } }],
        dateToAvoid: [{
          key: { text: 'Question' },
          value: { html: 'Are there any dates you cannot go to the appointment?' }
        }, { key: { text: 'Answer' }, value: { html: 'Yes' } }, {
          key: { text: 'Dates to avoid' },
          value: {
            html: '<b>Date</b><br><pre>2020-09-05</pre><br><b>Reason</b><br><pre>Away</pre>'
          }
        }, {
          key: { text: null },
          value: {
            html: '<b>Date</b><br><pre>2020-09-06</pre><br><b>Reason</b><br><pre>Also Away</pre>'
          }
        }],
        hearingLoop: [{ key: { text: 'Question' }, value: { html: 'Hearing loop' } }, { key: { text: 'Answer' }, value: { html: 'Yes' } }],
        interpreter: [{
          key: { text: 'Question' },
          value: { html: 'Will you need an interpreter at the appointment?' }
        }, { key: { text: 'Answer' }, value: { html: 'Yes' } }, {
          key: { text: 'Language Dialect' },
          value: { html: 'Albanian<br><pre></pre><br>' }
        }],
        multiEvidence: [{
          key: { text: 'Question' },
          value: { html: 'Will you bring any multimedia evidence' }
        }, { key: { text: 'Answer' }, value: { html: 'No' } }, {
          key: { text: 'Question' },
          value: { html: 'Will you bring the equipment to play this evidence' }
        }, { key: { text: 'Answer' }, value: { html: 'No' } }],
        pastExperiences: [{
          key: { text: 'Question' },
          value: {
            html: 'Have you had any past experiences that may affect you at the appointment?'
          }
        }, { key: { text: 'Answer' }, value: { html: 'Yes' } }, {
          key: { text: 'Question' },
          value: {
            html: 'Tell us how any past experiences may affect you at the appointment'
          }
        }, { key: { text: 'Answer' }, value: { html: '' } }],
        physicalOrMental: [{
          key: { text: 'Question' },
          value: {
            html: 'Do you have any physical or mental health conditions that may affect you at the hearing?'
          }
        }, { key: { text: 'Answer' }, value: { html: 'Yes' } }, {
          key: { text: 'Question' },
          value: { html: 'Tell us how any physical or mental health conditions you have that may affect you at the appointment' }
        }, { key: { text: 'Answer' }, value: { html: '' } }],
        previousPage: '/appeal-overview',
        privateAppointment: [{
          key: { text: 'Question' },
          value: { html: 'Will you need a private appointment?' }
        }, { key: { text: 'Answer' }, value: { html: 'Yes' } }, {
          key: { text: 'Question' },
          value: { html: 'Tell us why you need a private appointment' }
        }, { key: { text: 'Answer' }, value: { html: 'Test Reason' } }],
        sexAppointment: [{
          key: { text: 'Question' },
          value: { html: 'Will you need an all-female or all-male appointment' }
        }, { key: { text: 'Answer' }, value: { html: 'Yes' } }, {
          key: { text: 'Question' },
          value: { html: 'What type of appointment will you need?' }
        }, { key: { text: 'Answer' }, value: { html: '' } }, {
          key: { text: 'Question' },
          value: { html: 'Tell us why you need an {{ appointmentType }} appointment' }
        }, { key: { text: 'Answer' }, value: { html: '' } }],
        stepFree: [{ key: { text: 'Question' }, value: { html: 'Step free access' } }, { key: { text: 'Answer' }, value: { html: 'Yes' } }]
      });
    });

    it('should test setupCmaRequirements', () => {
      req.session.appeal.history = expectedEventsWithCmaRequirements;

      const object: object = setupCmaRequirementsViewer(req as Request);
      expect(object).to.have.property('hearingLoop');
      expect(object).to.deep.include({
        'anythingElse': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Will you need anything else at the appointment?'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          },
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Tell us what you will need and why you need it'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': ''
            }
          }
        ],
        'hearingLoop': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Hearing loop'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          }
        ],
        'interpreter': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Will you need an interpreter at the appointment?'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          },
          {
            'key': {
              'text': 'Language Dialect'
            },
            'value': {
              'html': 'Albanian<br><pre></pre><br>'
            }
          }
        ],
        'multiEvidence': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Will you bring any multimedia evidence'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'No'
            }
          },
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Will you bring the equipment to play this evidence'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'No'
            }
          }
        ],
        'pastExperiences': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Have you had any past experiences that may affect you at the appointment?'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          },
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Tell us how any past experiences may affect you at the appointment'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': ''
            }
          }
        ],
        'physicalOrMental': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Do you have any physical or mental health conditions that may affect you at the hearing?'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          },
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Tell us how any physical or mental health conditions you have that may affect you at the appointment'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': ''
            }
          }
        ],
        'privateAppointment': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Will you need a private appointment?'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          },
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Tell us why you need a private appointment'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Test Reason'
            }
          }
        ],
        'sexAppointment': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Will you need an all-female or all-male appointment'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          },
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'What type of appointment will you need?'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': ''
            }
          },
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Tell us why you need an {{ appointmentType }} appointment'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': ''
            }
          }
        ],
        'stepFree': [
          {
            'key': {
              'text': 'Question'
            },
            'value': {
              'html': 'Step free access'
            }
          },
          {
            'key': {
              'text': 'Answer'
            },
            'value': {
              'html': 'Yes'
            }
          }
        ]
      });
    });
  });
});
