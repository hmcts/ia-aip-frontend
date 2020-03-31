import { NextFunction, Request, Response } from 'express';
import {
  getAppealDetailsViewer,
  getDocumentViewer,
  getHoEvidenceDetailsViewer,
  getReasonsForAppealViewer,
  setupDetailViewersController
} from '../../../app/controllers/detail-viewers';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';
import { expectedMultipleEventsData } from '../mockData/events/expectation/expected-multiple-events';

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
          application: {}
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
      const middleware = [];
      setupDetailViewersController(middleware, documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.common.viewHomeOfficeDocuments, middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.common.documentViewer + '/:documentId', middleware);
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
          url: "<a class='govuk-link' target='_blank' rel=\"noopener noreferrer\" href='/view/document/someUUID'>evidence_file(PNG)</a>"
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
        'key': { 'text': 'Providing supporting evidence' },
        'value': { 'html': "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/00000'>404 1(PNG)</a>" }
      } ];
      getReasonsForAppealViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/reasons-for-appeal-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.common.overview
      });
    });
  });
});
