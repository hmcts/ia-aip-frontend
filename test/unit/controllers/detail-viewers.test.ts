import { NextFunction, Request, Response } from 'express';
import {
  getAppealDetailsViewer,
  getCmaRequirementsViewer,
  getDocumentViewer,
  getHoEvidenceDetailsViewer,
  getNoticeEndedAppeal,
  getOutOfTimeDecisionViewer,
  getReasonsForAppealViewer,
  getTimeExtensionDecisionViewer,
  getTimeExtensionViewer,
  setupCmaRequirementsViewer,
  setupDetailViewersController
} from '../../../app/controllers/detail-viewers';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import Logger from '../../../app/utils/logger';
import i18n from '../../../locale/en.json';
import { expect, sinon } from '../../utils/testUtils';
import { expectedEventsWithTimeExtensionsData } from '../mockData/events/expectation/expected-events-with-time-extensions';
import { expectedEventsWithCmaRequirements } from '../mockData/events/expectation/expected-history-cma-requirements';
import { expectedMultipleEventsData } from '../mockData/events/expectation/expected-multiple-events';
import { expectedTimeExtensionMap } from '../mockData/events/expectation/timeExtensionMap/expected-time-extension-map';

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
          cmaRequirements:  {
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
      expect(routerGetStub).to.have.been.calledWith(paths.common.detailsViewers.document + '/:documentId');
      expect(routerGetStub).to.have.been.calledWith(paths.common.detailsViewers.homeOfficeDocuments);
      expect(routerGetStub).to.have.been.calledWith(paths.common.detailsViewers.appealDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.common.detailsViewers.reasonsForAppeal);
      expect(routerGetStub).to.have.been.calledWith(paths.common.detailsViewers.timeExtension + '/:id');
      expect(routerGetStub).to.have.been.calledWith(paths.common.detailsViewers.timeExtensionDecision + '/:id');
      expect(routerGetStub).to.have.been.calledWith(paths.common.detailsViewers.cmaRequirementsAnswer);
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
          evidence: {
            fileId: 'someUUID',
            name: 'evidence_file.png'
          }
        }
      ];

      getHoEvidenceDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('detail-viewers/view-ho-details.njk', {
        documents: [ {
          dateUploaded: '21 February 2020',
          url: "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/someUUID'>evidence_file(PNG)</a>"
        } ],
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

  describe('getDocumentViewer', () => {
    it('should display file', async () => {
      req.params.documentId = '1';
      req.session.appeal.documentMap = [ { id: '1', url: 'documentStoreUrl' } ];

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
      req.session.appeal.documentMap = [ { id: '1', url: 'documentStoreUrl' } ];
      const error = new Error('an error');
      documentManagementService.fetchFile = sandbox.stub().throws(error);
      await getDocumentViewer(documentManagementService as DocumentManagementService)(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getAppealDetailsViewer', () => {
    it('should render detail-viewers/appeal-details-viewer.njk', () => {

      req.session.appeal.history = expectedMultipleEventsData;
      req.session.appeal.documentMap = [ {
        id: '00000',
        url: 'http://dm-store:4506/documents/7aea22e8-ca47-4e3c-8cdb-d24e96e2890c'
      }, {
        id: '00001',
        url: 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192'
      } ];

      const expectedSummaryRows = [
        { key: { text: 'Home Office reference number' }, value: { html: 'A1234567' } },
        { key: { text: 'Date letter sent' }, value: { html: '16 February 2020' } },
        { key: { text: 'Name' }, value: { html: 'Aleka sad' } },
        { key: { text: 'Date of birth' }, value: { html: '20 July 1994' } },
        { key: { text: 'Nationality' }, value: { html: 'Albania' } },
        { key: { text: 'Address' }, value: { html: 'United Kingdom<br>W1W 7RT<br>LONDON<br>60 GREAT PORTLAND STREET' } },
        { key: { text: 'Contact details' }, value: { html: 'alejandro@example.net<br>' } },
        { key: { text: 'Appeal type' }, value: { html: 'Protection' } } ];

      getAppealDetailsViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/appeal-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('getAppealDetailsViewer should catch exception and call next with the error', () => {

      req.session.appeal.history = expectedMultipleEventsData;
      req.session.appeal.documentMap = [ {
        id: '00000',
        url: 'http://dm-store:4506/documents/7aea22e8-ca47-4e3c-8cdb-d24e96e2890c'
      }, {
        id: '00001',
        url: 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192'
      } ];

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getAppealDetailsViewer(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getReasonsForAppealViewer', () => {
    it('should render detail-viewers/reasons-for-appeal-details-viewer.njk', () => {

      req.session.appeal.history = expectedMultipleEventsData;
      req.session.appeal.documentMap = [ {
        id: '00000',
        url: 'http://dm-store:4506/documents/3867d40b-f1eb-477b-af49-b9a03bc27641'
      }, {
        id: '00001',
        url: 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192'
      } ];

      const expectedSummaryRows = [ {
        'key': { 'text': 'Why do you think the Home Office decision is wrong?' },
        'value': { 'html': 'HELLO' }
      }, {
        'key': { 'text': 'Provide supporting evidence' },
        'value': { 'html': "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/00000'>404 1(PNG)</a>" }
      } ];
      getReasonsForAppealViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/reasons-for-appeal-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('getReasonsForAppealViewer should catch exception and call next with the error', () => {

      req.session.appeal.history = expectedMultipleEventsData;
      req.session.appeal.documentMap = [ {
        id: '00000',
        url: 'http://dm-store:4506/documents/7aea22e8-ca47-4e3c-8cdb-d24e96e2890c'
      }, {
        id: '00001',
        url: 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192'
      } ];

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getAppealDetailsViewer(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getTimeExtensionViewer', () => {
    it('should render detail-viewers/time-extension-details-viewer.njk with no evidences', () => {

      req.params.id = '0af8b4fe-664c-41d2-9587-2cb96e5bfe51';

      req.session.appeal.history = expectedEventsWithTimeExtensionsData;
      req.session.appeal.timeExtensionEventsMap = expectedTimeExtensionMap;

      const expectedSummaryRows = [
        {
          key: { text: 'How much time to you need and why do you need it?' },
          value: { html: 'I need more time while I am waiting for a letter' }
        } ];

      getTimeExtensionViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/time-extension-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render detail-viewers/time-extension-details-viewer.njk with evidences', () => {

      req.params.id = '1d1479a7-95a4-42c8-b718-44b764e6b935';

      req.session.appeal.history = expectedEventsWithTimeExtensionsData;
      req.session.appeal.timeExtensionEventsMap = expectedTimeExtensionMap;
      req.session.appeal.documentMap = [];

      getTimeExtensionViewer(req as Request, res as Response, next);

      const expectedDocumentId = req.session.appeal.documentMap[0].id;
      const expectedSummaryRows = [
        {
          key: { text: 'How much time to you need and why do you need it?' },
          value: { html: 'I need an extra 2 weeks' }
        },
        {
          key: { text: 'Supporting evidence' },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/${expectedDocumentId}'>supporting evidence(JPG)</a>` }
        } ];

      expect(res.render).to.have.been.calledWith('detail-viewers/time-extension-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('getTimeExtensionViewer should catch exception and call next with the error', () => {

      req.params.id = '25134779-79b7-4519-a4bd-e23e2f1d5ba8';

      req.session.appeal.history = expectedEventsWithTimeExtensionsData;
      req.session.appeal.timeExtensionEventsMap = expectedTimeExtensionMap;

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getTimeExtensionViewer(req as Request, res as Response, next);
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
      req.session.appeal.tribunalDocuments = [ document ];
      const expectedSummaryRows = [
        {
          key: { text: i18n.pages.detailViewers.common.dateUploaded },
          value: { html: '01 June 2021' }
        },
        {
          key: { text: i18n.pages.detailViewers.common.document },
          value: { html: `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/${document.fileId}'>PA 50002 2021-perez-NoticeOfEndedAppeal(PDF)</a>` }
        } ];

      getNoticeEndedAppeal(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('templates/details-viewer.njk', {
        title: i18n.pages.detailViewers.endedAppeal.title,
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should catch error and call next with it', () => {
      req.session.appeal.tribunalDocuments = [ document ];
      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);

      getNoticeEndedAppeal(req as Request, res as Response, next);
      expect(next).to.have.been.calledWith(error);
    });
  });

  describe('getTimeExtensionDecisionViewer', () => {
    it('should render detail-viewers/time-extension-decision-details-viewer.njk  with refused decision', () => {

      req.params.id = '25134779-79b7-4519-a4bd-e23e2f1d5ba8';

      req.session.appeal.history = expectedEventsWithTimeExtensionsData;
      req.session.appeal.timeExtensionEventsMap = expectedTimeExtensionMap;

      const expectedSummaryRows = [
        {
          key: { text: 'How much time to you need and why do you need it?' },
          value: { html: 'granted' }
        },
        {
          key: { text: 'Decision' },
          value: { html: 'I have granted your request you know have more time' }
        } ];

      getTimeExtensionDecisionViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/time-extension-decision-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('should render detail-viewers/time-extension-decision-details-viewer.njk with granted decision', () => {

      req.params.id = 'c5532555-aa49-4a11-88a4-69d98d27ba95';

      req.session.appeal.history = expectedEventsWithTimeExtensionsData;
      req.session.appeal.timeExtensionEventsMap = expectedTimeExtensionMap;
      req.session.appeal.documentMap = [];

      getTimeExtensionDecisionViewer(req as Request, res as Response, next);

      const expectedSummaryRows = [
        {
          key: { text: 'How much time to you need and why do you need it?' },
          value: { html: 'refused' }
        },
        {
          key: { text: 'Decision' },
          value: { html: 'Not enough information' }
        } ];

      expect(res.render).to.have.been.calledWith('detail-viewers/time-extension-decision-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });

    it('getTimeExtensionDecisionViewer should catch exception and call next with the error', () => {

      req.params.id = 'c5532555-aa49-4a11-88a4-69d98d27ba95';

      req.session.appeal.history = expectedEventsWithTimeExtensionsData;
      req.session.appeal.timeExtensionEventsMap = expectedTimeExtensionMap;

      const error = new Error('an error');
      res.render = sandbox.stub().throws(error);
      getTimeExtensionDecisionViewer(req as Request, res as Response, next);
      expect(next).to.have.been.calledOnce.calledWith(error);
    });
  });

  describe('getOutOfTimeDecisionViewer @outOfTime', () => {
    const document = {
      fileId: 'a3d396eb-277d-4b66-81c8-627f57212ec8',
      name: 'PA 50002 2021-perez-NoticeOfEndedAppeal.PDF',
      id: '1',
      tag: 'recordOutOfTimeDecisionDocument',
      dateUploaded: '2021-06-01'
    };
    it('should render details-viewer.njk template', () => {
      req.session.appeal.tribunalDocuments = [ document ];
      getOutOfTimeDecisionViewer(req as Request, res as Response, next);

      expect(res.render).to.have.been.called;
    });

    it('should catch error', () => {
      req.session.appeal.tribunalDocuments = [ document ];
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
