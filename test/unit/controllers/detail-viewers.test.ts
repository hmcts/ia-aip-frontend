import { NextFunction, Request, Response } from 'express';
import {
  getAppealDetailsViewer,
  getApplicationTitle,
  getCmaRequirementsViewer,
  getDecisionAndReasonsViewer,
  getDirectionHistory,
  getDocumentViewer,
  getFtpaAppellantApplication,
  getFtpaDecisionDetails,
  getHearingBundle,
  getHearingNoticeViewer,
  getHoEvidenceDetailsViewer,
  getHomeOfficeResponse,
  getHomeOfficeWithdrawLetter,
  getLrReasonsForAppealViewer,
  getMakeAnApplicationDecisionWhatNext,
  getMakeAnApplicationSummaryRows,
  getMakeAnApplicationViewer,
  getNoticeEndedAppeal,
  getOutOfTimeDecisionViewer,
  getReasonsForAppealViewer, getRespondentApplicationSummaryRows,
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
      expect(routerGetStub).to.have.been.calledWith(paths.common.makeAnApplicationViewer + '/:id');
      expect(routerGetStub).to.have.been.calledWith(paths.common.cmaRequirementsAnswerViewer);
      expect(routerGetStub).to.have.been.calledWith(paths.common.homeOfficeWithdrawLetter);
      expect(routerGetStub).to.have.been.calledWith(paths.common.lrReasonsForAppealViewer);
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

  describe('getLrReasonsForAppealViewer', () => {
    it('should render detail-viewers/reasons-for-appeal-details-viewer.njk', () => {

      req.session.appeal.reasonsForAppeal = {
        'applicationReason': 'appeal argument',
        'uploadDate': '2022-09-27',
        'evidences': [
          {
            'fileId': '00000',
            'name': 'test.txt',
            'dateUploaded': '2022-09-27',
            'description': 'Appeal Reasons supporting evidence'
          },
          {
            'fileId': '00001',
            'name': 'test1.txt',
            'dateUploaded': '2022-09-27',
            'description': 'Additional supporting evidence'
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
        'key': { 'text': 'Date uploaded' },
        'value': { 'html': '2022-09-27' }
      }, {
        'key': { 'text': 'Document' },
        'value': { 'html': "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/00000'>test.txt</a>" }
      }, {
        'key': { 'text': 'Document description' },
        'value': { 'html': 'Appeal Reasons supporting evidence' }
      }, {
        'key': { 'text': 'Additional evidence' },
        'value': { 'html': "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/00001'>test1.txt</a>" }
      }, {
        'key': { 'text': 'Document description' },
        'value': { 'html': 'Additional supporting evidence' }
      }];

      getLrReasonsForAppealViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/reasons-for-appeal-details-viewer.njk', {
        hint: i18n.pages.detailViewers.reasonsForAppealCheckAnswersHistory.hint,
        previousPage: paths.common.overview,
        data: expectedSummaryRows
      });
    });

    it('getLrReasonsForAppealViewer should catch exception and call next with the error', () => {

      req.session.appeal.reasonsForAppeal = {
        'applicationReason': 'appeal argument',
        'uploadDate': '2022-09-27',
        'evidences': [
          {
            'fileId': '00000',
            'name': 'test.txt',
            'dateUploaded': '2022-09-27',
            'description': 'Appeal Reasons supporting evidence'
          },
          {
            'fileId': '00001',
            'name': 'test1.txt',
            'dateUploaded': '2022-09-27',
            'description': 'Additional supporting evidence'
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
      getLrReasonsForAppealViewer(req as Request, res as Response, next);
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
          appellantInUk: 'Yes',
          homeOfficeRefNumber: 'A1234567',
          outsideUkWhenApplicationMade: 'No',
          gwfReferenceNumber: '',
          dateClientLeaveUk: {
            year: '2022',
            month: '2',
            day: '19'
          },
          dateLetterSent: {
            day: '16',
            month: '2',
            year: '2020'
          },
          decisionLetterReceivedDate: {
            year: '2020',
            month: '2',
            day: '16'
          },
          appealType: 'protection',
          contactDetails: {
            email: 'test@email.com',
            wantsEmail: true,
            phone: '7759991234',
            wantsSms: true
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
        { key: { text: 'In the UK' }, value: { html: 'Yes' } },
        {
          key: { text: 'Home Office reference number' },
          value: { html: 'A1234567' }
        },
        {
          key: { text: 'Date letter sent' },
          value: { html: '16 February 2020' }
        },
        {
          key: { text: 'Home Office decision letter' },
          value: {
            html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/f1d73cba-a117-4a0c-acf3-d8b787c984d7'>unnamed.jpg</a><br><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/3d8bf49d-766f-4f41-b814-e82a04dec002'>Screenshot 2021-06-10 at 13.01.57.png</a>"
          }
        },
        { key: { text: 'Name' }, value: { html: 'Pablo Ramirez' } },
        { key: { text: 'Date of birth' }, value: { html: '20 July 1988' } },
        { key: { text: 'Nationality' }, value: { html: 'Albania' } },
        {
          key: { text: 'Address' },
          value: {
            html: '60 GREAT PORTLAND STREET<br>LONDON<br>United Kingdom<br>W1W 7RT'
          }
        },
        {
          key: { text: 'Contact details' },
          value: { html: 'test@email.com<br>7759991234' }
        },
        { key: { text: 'Appeal type' }, value: { html: 'Protection' } },
        {
          key: { text: 'Reason for late appeal' },
          value: { html: 'a reason for being late' }
        },
        {
          key: { text: 'Supporting evidence' },
          value: {
            html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/318c373c-dd10-4deb-9590-04282653715d'>MINI-UK-66-reg.jpg</a>"
          }
        }
      ];
    });

    it('should render detail-viewers/appeal-details-viewer.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
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

    // it('should render detail-viewers/appeal-details-viewer.njk deprivation appeal type, payments flag ON @detailsViewer', async () => {
    //   sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    //   expectedSummaryRows[8].value.html = 'Deprivation of Citizenship';
    //   expectedSummaryRows.push(
    //     { key: { text: 'Decision Type' }, value: { html: 'Decision with a hearing' } }
    //   );
    //   req.session.appeal.application.appealType = 'deprivation';
    //   req.session.appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
    //
    //   await getAppealDetailsViewer(req as Request, res as Response, next);
    //   expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
    //     title: i18n.pages.detailViewers.appealDetails.title,
    //     previousPage: paths.common.overview,
    //     data: expectedSummaryRows
    //   });
    // });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await getAppealDetailsViewer(req as Request, res as Response, next);
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
          appellantInUk: 'No',
          homeOfficeRefNumber: 'A1234567',
          outsideUkWhenApplicationMade: 'No',
          gwfReferenceNumber: '',
          dateClientLeaveUk: {
            year: '2022',
            month: '2',
            day: '19'
          },
          dateLetterSent: {
            day: '16',
            month: '2',
            year: '2020'
          },
          decisionLetterReceivedDate: {
            year: '2020',
            month: '2',
            day: '16'
          },
          appealType: 'protection',
          contactDetails: {
            email: 'test@email.com',
            wantsEmail: true,
            phone: '7759991234',
            wantsSms: true
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
            nationality: 'AL'
          },
          appellantOutOfCountryAddress: '28 Some Street, Ukraine, 23543',
          hasSponsor: 'Yes',
          sponsorFamilyName: 'Frank',
          sponsorGivenNames: 'Smith',
          sponsorNameForDisplay: 'Frank Smith',
          sponsorContactDetails: {
            email: 'frank@email.com',
            wantsEmail: true,
            phone: '7759999999',
            wantsSms: true
          },
          sponsorAddress: {
            line1: '60 GREAT PORTLAND STREET',
            line2: '',
            city: 'LONDON',
            county: 'United Kingdom',
            postcode: 'W1W 7RT'
          },
          sponsorAuthorisation: 'Yes'
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
        { key: { text: 'In the UK' }, value: { html: 'No' } },
        { key: { text: 'Home Office reference number' }, value: { html: 'A1234567' } },
        { key: { text: 'Date letter sent' }, value: { html: '16 February 2020' } },
        { key: { text: 'Home Office decision letter' }, value: { html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/f1d73cba-a117-4a0c-acf3-d8b787c984d7'>unnamed.jpg</a><br><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/3d8bf49d-766f-4f41-b814-e82a04dec002'>Screenshot 2021-06-10 at 13.01.57.png</a>" } },
        { key: { text: 'Name' }, value: { html: 'Pablo Ramirez' } },
        { key: { text: 'Date of birth' }, value: { html: '20 July 1988' } },
        { key: { text: 'Nationality' }, value: { html: 'Albania' } },
        { key: { text: 'Address' }, value: { html: '28 Some Street, Ukraine, 23543' } },
        { key: { text: 'Contact details' }, value: { html: 'test@email.com<br>7759991234' } },
        { key: { text: 'Sponsor' }, value: { html: 'Yes' } },
        { key: { text: 'Sponsor\'s name' }, value: { html: 'Frank Smith' } },
        { key: { text: 'Sponsor\'s address' }, value: { html: '60 GREAT PORTLAND STREET<br>LONDON<br>United Kingdom<br>W1W 7RT' } },
        { key: { text: 'Sponsor\'s contact details' }, value: { html: 'frank@email.com<br>7759999999' } },
        { key: { text: 'Sponsor has access to information' }, value: { html: 'Yes' } },
        { key: { text: 'Appeal type' }, value: { html: 'Protection' } },
        { key: { text: 'Reason for late appeal' }, value: { html: 'a reason for being late' } },
        { key: { text: 'Supporting evidence' }, value: { html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/318c373c-dd10-4deb-9590-04282653715d'>MINI-UK-66-reg.jpg</a>" } }
      ];
    });

    it('should render detail-viewers/appeal-details-viewer.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
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

    // it('should render detail-viewers/appeal-details-viewer.njk deprivation appeal type, payments flag ON @detailsViewer', async () => {
    //   sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    //   expectedSummaryRows[8].value.html = 'Deprivation of Citizenship';
    //   expectedSummaryRows.push(
    //     { key: { text: 'Decision Type' }, value: { html: 'Decision with a hearing' } }
    //   );
    //   req.session.appeal.application.appealType = 'deprivation';
    //   req.session.appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
    //   await getAppealDetailsViewer(req as Request, res as Response, next);
    //   expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
    //     title: i18n.pages.detailViewers.appealDetails.title,
    //     previousPage: paths.common.overview,
    //     data: expectedSummaryRows
    //   });
    // });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await getAppealDetailsViewer(req as Request, res as Response, next);
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
          appellantInUk: 'No',
          homeOfficeRefNumber: 'A1234567',
          outsideUkWhenApplicationMade: 'No',
          gwfReferenceNumber: '',
          dateClientLeaveUk: {
            year: '2022',
            month: '2',
            day: '19'
          },
          dateLetterSent: {
            day: '16',
            month: '2',
            year: '2020'
          }, decisionLetterReceivedDate: {
            year: '2020',
            month: '2',
            day: '16'
          },
          appealType: 'protection',
          contactDetails: {
            email: 'test@email.com',
            wantsEmail: true,
            phone: '7759991234',
            wantsSms: true
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
            nationality: 'AL'
          },
          appellantOutOfCountryAddress: '28 Some Street, Ukraine, 23543',
          hasSponsor: 'No'
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
        { key: { text: 'In the UK' }, value: { html: 'No' } },
        { key: { text: 'Home Office reference number' }, value: { html: 'A1234567' } },
        { key: { text: 'Date letter sent' }, value: { html: '16 February 2020' } },
        { key: { text: 'Home Office decision letter' }, value: { html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/f1d73cba-a117-4a0c-acf3-d8b787c984d7'>unnamed.jpg</a><br><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/3d8bf49d-766f-4f41-b814-e82a04dec002'>Screenshot 2021-06-10 at 13.01.57.png</a>" } },
        { key: { text: 'Name' }, value: { html: 'Pablo Ramirez' } },
        { key: { text: 'Date of birth' }, value: { html: '20 July 1988' } },
        { key: { text: 'Nationality' }, value: { html: 'Albania' } },
        { key: { text: 'Address' }, value: { html: '28 Some Street, Ukraine, 23543' } },
        { key: { text: 'Contact details' }, value: { html: 'test@email.com<br>7759991234' } },
        { key: { text: 'Sponsor' }, value: { html: 'No' } },
        { key: { text: 'Appeal type' }, value: { html: 'Protection' } },
        { key: { text: 'Reason for late appeal' }, value: { html: 'a reason for being late' } },
        { key: { text: 'Supporting evidence' }, value: { html: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/318c373c-dd10-4deb-9590-04282653715d'>MINI-UK-66-reg.jpg</a>" } }
      ];
    });

    it('should render detail-viewers/appeal-details-viewer.njk', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
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

    // it('should render detail-viewers/appeal-details-viewer.njk deprivation appeal type, payments flag ON @detailsViewer', async () => {
    //   sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(true);
    //   expectedSummaryRows[8].value.html = 'Deprivation of Citizenship';
    //   expectedSummaryRows.push(
    //     { key: { text: 'Decision Type' }, value: { html: 'Decision with a hearing' } }
    //   );
    //   req.session.appeal.application.appealType = 'deprivation';
    //   req.session.appeal.application.rpDcAppealHearingOption = 'decisionWithHearing';
    //   await getAppealDetailsViewer(req as Request, res as Response, next);
    //   expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
    //     title: i18n.pages.detailViewers.appealDetails.title,
    //     previousPage: paths.common.overview,
    //     data: expectedSummaryRows
    //   });
    // });

    it('should catch exception and call next with the error', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.CARD_PAYMENTS, false).resolves(false);
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      await getAppealDetailsViewer(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getMakeAnApplicationViewer', () => {
    it('should render detail-viewers/make-an-application-details-viewer.njk with no evidences for appellant', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
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
      };
      req.session.appeal.hearingCentre = 'taylorHouse';
      req.session.appeal.makeAnApplications = [makeAnApplications];
      req.session.appeal.makeAnApplicationEvidence = [{
        id: 'id',
        fileId: '123456',
        name: 'name',
        tag: 'test-tag',
        suppliedBy: 'test-supplied',
        description: 'test-description',
        dateUploaded: 'test-date'
      }];
      getMakeAnApplicationViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/make-an-application-details-viewer.njk', {
        previousPage: paths.common.overview,
        title: i18n.pages.detailViewers.makeAnApplication.appellant.title,
        whatNextTitle: i18n.pages.detailViewers.makeAnApplication.appellant.whatNext.title,
        request: sinon.match.any,
        response: sinon.match.any,
        whatNext: null,
        hearingCentreEmail: 'IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL'
      });
    });

    it('should render detail-viewers/make-an-application-details-viewer.njk with decision for Legal rep', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '3',
        'value': {
          'date': '2022-07-18',
          'type': 'Judge\'s review of application decision',
          'state': 'preHearing',
          'details': 'application-details',
          'decision': 'Refused',
          'evidence': [
            {
              'fileId': '4bc22a7b-48f6-45c0-8072-2ddbc1e418b9',
              'name': 'evidence.pdf'
            }
          ],
          'applicant': 'Legal representative',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-legalrep-solicitor',
          'decisionMaker': 'Judge',
          'decisionReason': 'decision-reason'
        }
      };
      req.params.id = '3';
      req.session.appeal.hearing = {
        hearingCentre: '',
        date: '',
        time: ''
      };
      req.session.appeal.hearingCentre = 'taylorHouse';
      req.session.appeal.makeAnApplications = [makeAnApplications];
      req.session.appeal.makeAnApplicationEvidence = [{
        id: 'id',
        fileId: '123456',
        name: 'name',
        tag: 'test-tag',
        suppliedBy: 'test-supplied',
        description: 'test-description',
        dateUploaded: 'test-date'
      }];
      getMakeAnApplicationViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/make-an-application-details-viewer.njk', {
        previousPage: paths.common.overview,
        title: i18n.pages.detailViewers.makeAnApplication.appellant.title,
        whatNextTitle: i18n.pages.detailViewers.makeAnApplication.appellant.whatNext.title,
        request: [
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.request.whatYouAskedFor },
            value: { html: i18n.pages.detailViewers.makeAnApplication.appellant.requestTypes.askJudgeReview }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.request.reason },
            value: { html: 'application-details' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.request.evidence },
            value: { html: '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/4bc22a7b-48f6-45c0-8072-2ddbc1e418b9\'>evidence.pdf</a>' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.request.date },
            value: { html: '18 July 2022' }
          }
        ],
        response: [
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.response.decision },
            value: { html: i18n.pages.detailViewers.makeAnApplication.appellant.response.Refused }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.response.reason },
            value: { html: 'decision-reason' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.response.date },
            value: { html: '22 July 2022' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.appellant.response.maker },
            value: { html: 'Judge' }
          }
        ],
        whatNext: i18n.pages.detailViewers.makeAnApplication.appellant.whatNext.askJudgeReview.refused,
        hearingCentreEmail: 'IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL'
      });
    });

    it('should render detail-viewers/make-an-application-details-viewer.njk for respondent (Expedite)', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '3',
        'value': {
          'date': '2022-07-18',
          'type': 'Expedite',
          'state': 'preHearing',
          'details': 'application-details',
          'decision': 'Pending',
          'evidence': [
            {
              'fileId': '4bc22a7b-48f6-45c0-8072-2ddbc1e418b9',
              'name': 'evidence.pdf'
            }
          ],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficeapc'
        }
      };
      req.params.id = '3';
      req.session.appeal.hearing = {
        hearingCentre: '',
        date: '',
        time: ''
      };
      req.session.appeal.hearingCentre = 'taylorHouse';
      req.session.appeal.makeAnApplications = [makeAnApplications];
      req.session.appeal.makeAnApplicationEvidence = [{
        id: 'id',
        fileId: '123456',
        name: 'name',
        tag: 'test-tag',
        suppliedBy: 'test-supplied',
        description: 'test-description',
        dateUploaded: 'test-date'
      }];
      getMakeAnApplicationViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/make-an-application-details-viewer.njk', {
        previousPage: paths.common.overview,
        title: i18n.pages.detailViewers.makeAnApplication.respondent.request.title,
        description: i18n.pages.detailViewers.makeAnApplication.respondent.request.description,
        whatNextTitle: i18n.pages.detailViewers.makeAnApplication.respondent.request.whatNext.title,
        request: [
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.type },
            value: { html: i18n.pages.detailViewers.makeAnApplication.respondent.request.types.Expedite }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.reason },
            value: { html: 'application-details' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.evidence },
            value: { html: '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/4bc22a7b-48f6-45c0-8072-2ddbc1e418b9\'>evidence.pdf</a>' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.date },
            value: { html: '18 July 2022' }
          }
        ],
        whatNextList: i18n.pages.detailViewers.makeAnApplication.respondent.request.whatNext.Expedite,
        hearingCentreEmail: 'IA_HEARING_CENTRE_TAYLOR_HOUSE_EMAIL'
      });
    });

    it('should render detail-viewers/make-an-application-details-viewer.njk for respondent (Reinstate an ended appeal)', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '3',
        'value': {
          'date': '2022-07-18',
          'type': 'Reinstate an ended appeal',
          'state': 'preHearing',
          'details': 'application-details',
          'decision': 'Pending',
          'evidence': [
            {
              'fileId': '4bc22a7b-48f6-45c0-8072-2ddbc1e418b9',
              'name': 'evidence.pdf'
            }
          ],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficeapc'
        }
      };
      req.params.id = '3';
      req.session.appeal.hearing = {
        hearingCentre: '',
        date: '',
        time: ''
      };
      req.session.appeal.hearingCentre = 'taylorHouse';
      req.session.appeal.makeAnApplications = [makeAnApplications];
      req.session.appeal.makeAnApplicationEvidence = [{
        id: 'id',
        fileId: '123456',
        name: 'name',
        tag: 'test-tag',
        suppliedBy: 'test-supplied',
        description: 'test-description',
        dateUploaded: 'test-date'
      }];
      getMakeAnApplicationViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/make-an-application-details-viewer.njk', {
        previousPage: paths.common.overview,
        title: i18n.pages.detailViewers.makeAnApplication.respondent.request.title,
        description: i18n.pages.detailViewers.makeAnApplication.respondent.request.description,
        whatNextTitle: i18n.pages.detailViewers.makeAnApplication.respondent.request.whatNext.title,
        request: [
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.type },
            value: { html: i18n.pages.detailViewers.makeAnApplication.respondent.request.types['Reinstate an ended appeal'] }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.reason },
            value: { html: 'application-details' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.evidence },
            value: { html: '<a class=\'govuk-link\' target=\'_blank\' rel=\'noopener noreferrer\' href=\'/view/document/4bc22a7b-48f6-45c0-8072-2ddbc1e418b9\'>evidence.pdf</a>' }
          },
          {
            key: { text: i18n.pages.detailViewers.makeAnApplication.respondent.request.date },
            value: { html: '18 July 2022' }
          }
        ],
        whatNextList: i18n.pages.detailViewers.makeAnApplication.respondent.request.whatNext['Reinstate an ended appeal'],
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

  describe('getApplicationTitle', () => {
    it('return title based on application type', () => {
      expect(getApplicationTitle('Time extension')).to.be.eq(i18n.pages.detailViewers.makeAnApplication.appellant.requestTypes.askForMoreTime);
      expect(getApplicationTitle('Link/unlink appeals')).to.be.eq(i18n.pages.detailViewers.makeAnApplication.appellant.requestTypes.askLinkUnlink);
    });

    it('return undefined for invalid application types', () => {
      expect(getApplicationTitle('INVALID')).to.be.eq(undefined);
    });
  });

  describe('getMakeAnApplicationDecisionWhatNext', () => {
    it('refused appellant application should show correct what next message.', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Reinstate an ended appeal',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Refused',
          'evidence': [],
          'applicant': 'Appellant',
          'decisionDate': '2022-07-22',
          'applicantRole': 'citizen',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.appellant.whatNext.askReinstate.refused);
    });

    it('refused appellant application should show correct what next message (default message).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Transfer',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Refused',
          'evidence': [],
          'applicant': 'Appellant',
          'decisionDate': '2022-07-22',
          'applicantRole': 'citizen',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.appellant.whatNext.default.refused);
    });

    it('granted appellant application should show correct what next message.', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Transfer',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Granted',
          'evidence': [],
          'applicant': 'Appellant',
          'decisionDate': '2022-07-22',
          'applicantRole': 'citizen',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.appellant.whatNext.askChangeHearing.granted);
    });

    it('refused respondent application should show correct what next message (Reinstate an ended appeal).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Reinstate an ended appeal',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Refused',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.default.refused);
    });

    it('granted respondent application should show correct what next message (Reinstate an ended appeal).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Reinstate an ended appeal',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Granted',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.askReinstate.granted);
    });

    it('Granted respondent application should show correct what next message (Judge\'s review of application decision).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': "Judge's review of application decision",
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Granted',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.askJudgeReview.granted);
    });

    it('Refused respondent application should show correct what next message (Judge\'s review of application decision).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': "Judge's review of application decision",
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Refused',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.default.refused);
    });

    it('granted respondent application should show correct what next message (Transfer).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Transfer',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Granted',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.askChangeHearing.granted);
    });

    it('Refused respondent application should show correct what next message (Transfer).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Transfer',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Refused',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.default.refused);
    });

    it('Refused respondent application should show correct what next message (Link/unlink appeals).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Link/unlink appeals',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Refused',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.default.refused);
    });

    it('Granted respondent application should show correct what next message (Link/unlink appeals).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Link/unlink appeals',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Granted',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.askLinkUnlink.granted);
    });

    it('Granted respondent application should show correct what next message (Other).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Other',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Granted',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.default.granted);
    });

    it('Refused respondent application should show correct what next message (Other).', () => {
      const makeAnApplications: Collection<Application<Evidence>> = {
        'id': '1',
        'value': {
          'date': '2022-07-18',
          'type': 'Other',
          'state': 'preHearing',
          'details': 'test application',
          'decision': 'Refused',
          'evidence': [],
          'applicant': 'Respondent',
          'decisionDate': '2022-07-22',
          'applicantRole': 'caseworker-ia-homeofficepou',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Lorem ipsum dolor sit amet. Sit amet justo donec enim diam.'
        }
      };

      const whatNext = getMakeAnApplicationDecisionWhatNext(makeAnApplications);

      expect(whatNext).to.be.eq(i18n.pages.detailViewers.makeAnApplication.respondent.response.whatNext.default.refused);
    });

  });

  describe('getMakeAnApplicationSummaryRows', () => {
    it('should get rows', () => {
      const addSummaryRowStub = sandbox.stub(summaryUtils, 'addSummaryRow');
      const makeAnApplicationPendingDecision: Collection<Application<Evidence>> = {
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

      getMakeAnApplicationSummaryRows(makeAnApplicationPendingDecision);
      expect(addSummaryRowStub).to.have.been.callCount(4);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.request.whatYouAskedFor, [i18n.pages.detailViewers.makeAnApplication.appellant.requestTypes.askForMoreTime]);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.request.reason, ['My reason']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.request.date, ['15 July 2021']);
    });

    it('should get rows with decision', () => {
      const addSummaryRowStub = sandbox.stub(summaryUtils, 'addSummaryRow');
      const makeAnApplicationPendingDecision = {
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

      getMakeAnApplicationSummaryRows(makeAnApplicationPendingDecision);
      expect(addSummaryRowStub).to.have.been.callCount(8);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.request.whatYouAskedFor, [i18n.pages.detailViewers.makeAnApplication.appellant.requestTypes.askForMoreTime]);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.request.reason, ['My reason']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.request.date, ['14 July 2021']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.response.decision, [i18n.pages.detailViewers.makeAnApplication.appellant.response.Refused]);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.response.reason, ['Reason not enough']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.response.date, ['14 July 2021']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.response.maker, ['Tribunal Caseworker']);
    });
  });

  describe('getRespondentApplicationSummaryRows', () => {
    it('should get rows for respondent pending decision', () => {
      const addSummaryRowStub = sandbox.stub(summaryUtils, 'addSummaryRow');
      const application: Collection<Application<Evidence>> = {
        'id': '2',
        'value': {
          'date': '2021-07-15',
          'type': 'Withdraw',
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
          'applicant': 'Respondent',
          'applicantRole': 'caseworker-ia-homeofficeapc'
        }
      };

      getRespondentApplicationSummaryRows(application);
      expect(addSummaryRowStub).to.have.been.callCount(4);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.request.type, ['Withdraw from the appeal']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.request.reason, ['My reason']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.request.date, ['15 July 2021']);
    });

    it('should get rows for respondent after decision', () => {
      const addSummaryRowStub = sandbox.stub(summaryUtils, 'addSummaryRow');
      const application: Collection<Application<Evidence>> = {
        'id': '2',
        'value': {
          'date': '2021-07-15',
          'type': 'Withdraw',
          'state': 'awaitingReasonsForAppeal',
          'details': 'My reason',
          'decision': 'Granted',
          'evidence': [{
            id: 'id',
            fileId: '123456',
            name: 'name',
            tag: 'test-tag',
            suppliedBy: 'test-supplied',
            description: 'test-description',
            dateUploaded: 'test-date'
          }],
          'applicant': 'Respondent',
          'applicantRole': 'caseworker-ia-homeofficeapc',
          'decisionDate': '2021-07-14',
          'decisionMaker': 'Tribunal Caseworker',
          'decisionReason': 'Reason not enough'
        }
      };

      getRespondentApplicationSummaryRows(application);
      expect(addSummaryRowStub).to.have.been.callCount(8);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.request.type, ['Withdraw from the appeal']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.request.reason, ['My reason']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.request.date, ['15 July 2021']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.appellant.response.decision, ['Granted']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.response.reason, ['Reason not enough']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.response.date, ['14 July 2021']);
      expect(addSummaryRowStub).to.have.been.calledWith(i18n.pages.detailViewers.makeAnApplication.respondent.response.maker, ['Tribunal Caseworker']);
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

  describe('getFtpaAppellantApplication', () => {
    const documents = [
      {
        fileId: '976fa409-4aab-40a4-a3f9-0c918f7293c8',
        name: 'FTPA_Appellant_Doc.PDF',
        tag: 'ftpaAppellant'
      }
    ];
    it('should render templates/details-viewer.njk with ftpa appellant application documents', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaAppellantGrounds: 'ftpaAppellantGrounds',
        ftpaAppellantApplicationDate: '2023-03-20',
        ftpaAppellantEvidenceDocuments: [ ...documents ],
        ftpaAppellantOutOfTimeExplanation: 'ftpaAppellantOutOfTimeExplanation',
        ftpaAppellantOutOfTimeDocuments: [ ...documents ]
      };
      const expectedSummaryRows = [
        {
          key: { text: i18n.pages.detailViewers.ftpaApplication.grounds },
          value: { html: 'ftpaAppellantGrounds' }
        },
        {
          key: { text: i18n.pages.detailViewers.ftpaApplication.evidence },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
        },
        {
          key: { text: i18n.pages.detailViewers.ftpaApplication.date },
          value: { html: '20&nbsp;March&nbsp;2023' }
        },
        {
          key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeReason },
          value: { html: 'ftpaAppellantOutOfTimeExplanation' }
        },
        {
          key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
        }
      ];

      getFtpaAppellantApplication(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.appellant,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });
    it('should catch error and call next with it', () => {
      const error = new Error('an error');
      req.session.appeal = {
        ...req.session.appeal,
        ftpaAppellantGrounds: 'ftpaAppellantGrounds',
        ftpaAppellantApplicationDate: '2023-03-20',
        ftpaAppellantEvidenceDocuments: [ ...documents ],
        ftpaAppellantOutOfTimeExplanation: 'ftpaAppellantOutOfTimeExplanation',
        ftpaAppellantOutOfTimeDocuments: [ ...documents ]
      };
      res.render = sandbox.stub().throws(error);

      getFtpaAppellantApplication(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getFtpaDecisionDetails', () => {
    const documents = [
      {
        fileId: '976fa409-4aab-40a4-a3f9-0c918f7293c8',
        name: 'FTPA_Respondent_Doc.PDF',
        tag: 'ftpaRespondent'
      }
    ];

    it('should render ftpa-application/ftpa-decision-details-viewer.nj with ftpa respondent application/decision details when granted', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'respondent',
        ftpaRespondentGroundsDocuments: [ ...documents ],
        ftpaRespondentApplicationDate: '2023-03-20',
        ftpaRespondentEvidenceDocuments: [ ...documents ],
        ftpaRespondentOutOfTimeExplanation: 'ftpaRespondentOutOfTimeExplanation',
        ftpaRespondentOutOfTimeDocuments: [ ...documents ],
        ftpaRespondentDecisionDate: '2023-03-20',
        ftpaRespondentDecisionDocument: [ ...documents ],
        ftpaRespondentDecisionOutcomeType: 'granted'
      };

      const expectedSummaryRows = {
        application: [
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.groundsDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.evidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeReason },
            value: { html: 'ftpaRespondentOutOfTimeExplanation' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          }
        ],
        decision: [
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decision },
            value: { html: 'Granted' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decisionDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ]
      };

      getFtpaDecisionDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/ftpa-decision-details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.respondent,
        subTitle: i18n.pages.detailViewers.ftpaDecision.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render ftpa-application/ftpa-decision-details-viewer.nj with ftpa respondent application/decision details when partially granted', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'respondent',
        ftpaRespondentGroundsDocuments: [ ...documents ],
        ftpaRespondentApplicationDate: '2023-03-20',
        ftpaRespondentEvidenceDocuments: [ ...documents ],
        ftpaRespondentOutOfTimeExplanation: 'ftpaRespondentOutOfTimeExplanation',
        ftpaRespondentOutOfTimeDocuments: [ ...documents ],
        ftpaRespondentDecisionDate: '2023-03-20',
        ftpaRespondentDecisionDocument: [ ...documents ],
        ftpaRespondentDecisionOutcomeType: 'partiallyGranted'
      };

      const expectedSummaryRows = {
        application: [
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.groundsDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.evidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeReason },
            value: { html: 'ftpaRespondentOutOfTimeExplanation' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          }
        ],
        decision: [
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decision },
            value: { html: 'Partially&nbsp;granted' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decisionDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ]
      };

      getFtpaDecisionDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/ftpa-decision-details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.respondent,
        subTitle: i18n.pages.detailViewers.ftpaDecision.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render ftpa-application/ftpa-decision-details-viewer.nj with ftpa respondent application/decision details when not admitted', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'respondent',
        ftpaRespondentGroundsDocuments: [ ...documents ],
        ftpaRespondentApplicationDate: '2023-03-20',
        ftpaRespondentEvidenceDocuments: [ ...documents ],
        ftpaRespondentOutOfTimeExplanation: 'ftpaRespondentOutOfTimeExplanation',
        ftpaRespondentOutOfTimeDocuments: [ ...documents ],
        ftpaRespondentDecisionDate: '2023-03-20',
        ftpaRespondentDecisionDocument: [ ...documents ],
        ftpaRespondentDecisionOutcomeType: 'notAdmitted'
      };

      const expectedSummaryRows = {
        application: [
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ],
        decision: [
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decision },
            value: { html: 'Not&nbsp;admitted' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decisionDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ]
      };

      getFtpaDecisionDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/ftpa-decision-details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.respondent,
        subTitle: i18n.pages.detailViewers.ftpaDecision.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render ftpa-application/ftpa-decision-details-viewer.nj with ftpa respondent application/decision details when refused', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'respondent',
        ftpaRespondentApplicationDate: '2023-03-20',
        ftpaRespondentDecisionDate: '2023-03-20',
        ftpaRespondentDecisionDocument: [ ...documents ],
        ftpaRespondentDecisionOutcomeType: 'refused'
      };

      const expectedSummaryRows = {
        application: [
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ],
        decision: [
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decision },
            value: { html: 'Refused' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decisionDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ]
      };

      getFtpaDecisionDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/ftpa-decision-details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.respondent,
        subTitle: i18n.pages.detailViewers.ftpaDecision.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render ftpa-application/ftpa-decision-details-viewer.nj with ftpa respondent application/decision details when refused by resident judge', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'respondent',
        ftpaRespondentApplicationDate: '2023-03-20',
        ftpaRespondentDecisionDate: '2023-03-20',
        ftpaRespondentDecisionDocument: [ ...documents ],
        ftpaRespondentRjDecisionOutcomeType: 'refused'
      };

      const expectedSummaryRows = {
        application: [
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ],
        decision: [
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decision },
            value: { html: 'Refused' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decisionDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Respondent_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ]
      };

      getFtpaDecisionDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/ftpa-decision-details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.respondent,
        subTitle: i18n.pages.detailViewers.ftpaDecision.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render ftpa-application/ftpa-decision-details-viewer.nj with ftpa appellant application/decision details', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'appellant',
        ftpaAppellantGrounds: 'ftpaAppellantGrounds',
        ftpaAppellantApplicationDate: '2023-03-20',
        ftpaAppellantEvidenceDocuments: [ ...documents ],
        ftpaAppellantOutOfTimeExplanation: 'ftpaAppellantOutOfTimeExplanation',
        ftpaAppellantOutOfTimeDocuments: [ ...documents ],
        ftpaAppellantDecisionDate: '2023-03-20',
        ftpaAppellantDecisionDocument: [ ...documents ],
        ftpaAppellantDecisionOutcomeType: 'granted'
      };
      documents[0].name = 'FTPA_Appellant_Doc.PDF';
      documents[0].tag = 'ftpaAppellant';

      const expectedSummaryRows = {
        application: [
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.grounds },
            value: { html: 'ftpaAppellantGrounds' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.evidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeReason },
            value: { html: 'ftpaAppellantOutOfTimeExplanation' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
          }
        ],
        decision: [
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decision },
            value: { html: 'Granted' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decisionDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ]
      };

      getFtpaDecisionDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/ftpa-decision-details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.appellant,
        subTitle: i18n.pages.detailViewers.ftpaDecision.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render ftpa-application/ftpa-decision-details-viewer.nj with ftpa appellant application/decision details for resident judge decision', () => {
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'appellant',
        ftpaAppellantGrounds: 'ftpaAppellantGrounds',
        ftpaAppellantApplicationDate: '2023-03-20',
        ftpaAppellantEvidenceDocuments: [ ...documents ],
        ftpaAppellantOutOfTimeExplanation: 'ftpaAppellantOutOfTimeExplanation',
        ftpaAppellantOutOfTimeDocuments: [ ...documents ],
        ftpaAppellantDecisionDate: '2023-03-20',
        ftpaAppellantDecisionDocument: [ ...documents ],
        ftpaAppellantRjDecisionOutcomeType: 'granted'
      };
      documents[0].name = 'FTPA_Appellant_Doc.PDF';
      documents[0].tag = 'ftpaAppellant';

      const expectedSummaryRows = {
        application: [
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.grounds },
            value: { html: 'ftpaAppellantGrounds' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.evidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeReason },
            value: { html: 'ftpaAppellantOutOfTimeExplanation' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaApplication.outOfTimeEvidence },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
          }
        ],
        decision: [
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decision },
            value: { html: 'Granted' }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.decisionDocument },
            value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/976fa409-4aab-40a4-a3f9-0c918f7293c8'>FTPA_Appellant_Doc.PDF</a>` }
          },
          {
            key: { text: i18n.pages.detailViewers.ftpaDecision.date },
            value: { html: '20&nbsp;March&nbsp;2023' }
          }
        ]
      };

      getFtpaDecisionDetails(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('ftpa-application/ftpa-decision-details-viewer.njk', {
        title: i18n.pages.detailViewers.ftpaApplication.title.appellant,
        subTitle: i18n.pages.detailViewers.ftpaDecision.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should catch error and call next with it', () => {
      const error = new Error('an error');
      req.session.appeal = {
        ...req.session.appeal,
        ftpaApplicantType: 'respondent',
        ftpaRespondentGroundsDocuments: [ ...documents ],
        ftpaRespondentApplicationDate: '2023-03-20',
        ftpaRespondentEvidenceDocuments: [ ...documents ],
        ftpaRespondentOutOfTimeExplanation: 'ftpaAppellantOutOfTimeExplanation',
        ftpaRespondentOutOfTimeDocuments: [ ...documents ],
        ftpaRespondentDecisionDate: '2023-03-20',
        ftpaRespondentDecisionDocument: [ ...documents ],
        ftpaRespondentDecisionOutcomeType: 'refused'
      };
      res.render = sandbox.stub().throws(error);

      getFtpaDecisionDetails(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getDirectionHistory', () => {
    const directions: Direction[] = [
      {
        id: '1',
        parties: 'appellant',
        tag: '',
        dateDue: '2023-12-15',
        dateSent: '2023-05-15',
        explanation: 'explanation1',
        uniqueId: '123456789',
        directionType: 'sendDirection'
      },
      {
        id: '2',
        parties: 'respondent',
        tag: '',
        dateDue: '2023-12-15',
        dateSent: '2023-05-15',
        explanation: 'explanation2',
        uniqueId: '987654321',
        directionType: 'sendDirection'
      }
    ];

    it('should render detail-viewers/direction-history-viewer.njk for sending direciotn of appellant', () => {
      req.session.appeal.directions = directions;
      req.params.id = '123456789';

      const expectedSummaryRows = [
        {
          key: { text: i18n.pages.detailViewers.directionHistory.appellant.explanation },
          value: { html: 'explanation1' }
        },
        {
          key: { text: i18n.pages.detailViewers.directionHistory.appellant.dateDue },
          value: { html: '15&nbsp;December&nbsp;2023' }
        },
        {
          key: { text: i18n.pages.detailViewers.directionHistory.dateSent },
          value: { html: '15&nbsp;May&nbsp;2023' }
        }
      ];

      getDirectionHistory(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('detail-viewers/direction-history-viewer.njk', {
        title: i18n.pages.detailViewers.directionHistory.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render detail-viewers/direction-history-viewer.njk for sending direciotn of Home Office', () => {
      req.session.appeal.directions = directions;
      req.params.id = '987654321';

      const expectedSummaryRows = [
        {
          key: { text: i18n.pages.detailViewers.directionHistory.respondent.explanation },
          value: { html: 'explanation2' }
        },
        {
          key: { text: i18n.pages.detailViewers.directionHistory.respondent.dateDue },
          value: { html: '15&nbsp;December&nbsp;2023' }
        },
        {
          key: { text: i18n.pages.detailViewers.directionHistory.dateSent },
          value: { html: '15&nbsp;May&nbsp;2023' }
        }
      ];

      getDirectionHistory(req as Request, res as Response, next);

      expect(res.render).to.have.been.calledWith('detail-viewers/direction-history-viewer.njk', {
        title: i18n.pages.detailViewers.directionHistory.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should catch error and call next with it', () => {
      req.session.appeal.directions = directions;
      req.params.id = '123456789';
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getDirectionHistory(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(error);
    });

  });

});
