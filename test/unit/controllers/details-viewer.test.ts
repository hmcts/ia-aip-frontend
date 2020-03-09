import express, { NextFunction, Request, Response } from 'express';
import { getReasonsForAppealViewer, setupDetailViewersController } from '../../../app/controllers/detail-viewers';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import { expect, sinon } from '../../utils/testUtils';
import { expectedMultipleEventsData } from '../mockData/events/expectations';

describe('Reasons For Appeal - Check and send Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let routerGetStub: sinon.SinonStub;
  let routerPostStub: sinon.SinonStub;

  let documentManagementService: Partial<DocumentManagementService>;

  const editParameter = '?edit';

  beforeEach(() => {

    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {},
          reasonsForAppeal: {
            applicationReason: 'a reason'
          }
        } as Partial<Appeal>
      } as Partial<Express.Session>
    } as Partial<Request>;
    res = {
      redirect: sandbox.spy(),
      render: sandbox.stub(),
      send: sandbox.stub()
    } as Partial<Response>;

    documentManagementService = { uploadFile: sandbox.stub(), deleteFile: sandbox.stub() };

    routerGetStub = sandbox.stub(express.Router as never, 'get');
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('setupDetailViewersController', () => {
    it('should setup the routes', () => {
      setupDetailViewersController(documentManagementService as DocumentManagementService);
      expect(routerGetStub).to.have.been.calledWith(paths.detailsViewers.appealDetails);
      expect(routerGetStub).to.have.been.calledWith(paths.detailsViewers.reasonsForAppeal);
    });
  });

  describe('getCheckAndSend', () => {
    it('should render detail-viewers/appeal-details-viewer.njk', () => {

      req.session.appeal.history = expectedMultipleEventsData;
      req.session.appeal.documentMap = [ {
        id: '00000',
        url: 'http://dm-store:4506/documents/7aea22e8-ca47-4e3c-8cdb-d24e96e2890c'
      }, {
        id: '00001',
        url: 'http://dm-store:4506/documents/1dc61149-db68-4bda-8b70-e5720f627192'
      } ];

      const expectedSummaryRows = [ {
        'key': { 'text': 'Why do you think the Home Office decision is wrong?' },
        'value': { 'html': 'HELLO' }
      }, {
        'key': { 'text': 'Providing supporting evidence' },
        'value': { 'html': "<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/00000'>404 1(PNG)</a><br><a class='govuk-link' target='_blank' rel='noopener noreferrer' href='/view/document/00001'>500(PNG)</a>" }
      } ];
      getReasonsForAppealViewer(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledWith('detail-viewers/reasons-for-appeal-details-viewer.njk', {
        data: expectedSummaryRows,
        previousPage: paths.overview
      });
    });
  });
});
