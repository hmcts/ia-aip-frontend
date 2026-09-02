import { NextFunction, Request, Response } from 'express';
import {
  getDocument,
  getDocuments,
  setupDocumentsController
} from '../../../app/controllers/documents-page';
import { paths } from '../../../app/paths';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import { expect, sinon } from '../../utils/testUtils';

describe('Documents controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;
  let setStub: sinon.SinonStub;
  let sendStub: sinon.SinonStub;
  let statusStub: sinon.SinonStub;
  let documentManagementService: {
    fetchFile: sinon.SinonStub;
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    documentManagementService = {
      fetchFile: sandbox.stub()
    };

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

    renderStub = sandbox.stub();
    setStub = sandbox.stub();
    sendStub = sandbox.stub();
    statusStub = sandbox.stub();

    res = {
      render: renderStub,
      set: setStub,
      send: sendStub,
      status: statusStub,
      locals: {}
    } as Partial<Response>;

    statusStub.returns(res);

    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDocuments', () => {
    it('should render the documents page', () => {
      const expectedRenderPayload = {
        title: 'Documents',
        documents: []
      };

      getDocuments(req as Request, res as Response, next);

      expect(renderStub).to.have.been.calledOnceWithExactly(
          'documents/documents.njk',
          expectedRenderPayload
      );
    });

    it('should render the documents from the session', () => {
      const documents = [
        {
          id: 'document-1',
          url: 'https://cdam/documents/document-1'
        },
        {
          id: 'document-2',
          url: 'https://cdam/documents/document-2'
        }
      ];

      req.session.appeal.documentMap = documents;

      getDocuments(req as Request, res as Response, next);

      expect(renderStub).to.have.been.calledOnceWithExactly(
          'documents/documents.njk',
          {
            title: 'Documents',
            documents
          }
      );
    });

    it('should pass an error to next when rendering fails', () => {
      const error = new Error('the error');

      renderStub.throws(error);

      getDocuments(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnceWithExactly(error);
    });
  });

  describe('getDocument', () => {
    it('should fetch and return the requested document', async () => {
      const document = {
        id: 'document-1',
        url: 'https://cdam/documents/document-1'
      };

      const documentData = Buffer.from('document content');

      const response = {
        data: documentData,
        headers: {
          'content-type': 'application/pdf'
        }
      };

      req.session.appeal.documentMap = [document];
      req.params = {
        documentId: 'document-1'
      };

      documentManagementService.fetchFile.resolves(response);

      await getDocument(
          req as Request,
          res as Response,
          next,
          documentManagementService as unknown as DocumentManagementService
      );

      expect(
          documentManagementService.fetchFile
      ).to.have.been.calledOnceWithExactly(
          req,
          document.url
      );

      expect(setStub).to.have.been.calledOnceWithExactly({
        'Content-Type': 'application/pdf'
      });

      expect(sendStub).to.have.been.calledOnceWithExactly(documentData);
    });

    it('should return a 404 when the requested document does not exist', async () => {
      req.session.appeal.documentMap = [
        {
          id: 'document-1',
          url: 'https://cdam/documents/document-1'
        }
      ];

      req.params = {
        documentId: 'document-2'
      };

      await getDocument(
          req as Request,
          res as Response,
          next,
          documentManagementService as unknown as DocumentManagementService
      );

      expect(statusStub).to.have.been.calledOnceWithExactly(404);

      expect(sendStub).to.have.been.calledOnceWithExactly(
          'Document not found'
      );

      expect(
          documentManagementService.fetchFile
      ).not.to.have.been.called;
    });

    it('should pass an error to next when fetching the document fails', async () => {
      const error = new Error('fetch failed');

      const document = {
        id: 'document-1',
        url: 'https://cdam/documents/document-1'
      };

      req.session.appeal.documentMap = [document];

      req.params = {
        documentId: 'document-1'
      };

      documentManagementService.fetchFile.rejects(error);

      await getDocument(
          req as Request,
          res as Response,
          next,
          documentManagementService as unknown as DocumentManagementService
      );

      expect(next).to.have.been.calledOnceWithExactly(error);

      expect(sendStub).not.to.have.been.called;
    });
  });

  describe('setupDocumentsController', () => {
    it('should create a router', () => {
      const router = setupDocumentsController(
          documentManagementService as unknown as DocumentManagementService
      );

      expect(router).to.exist;
    });

    it('should register the documents page GET route', () => {
      const router = setupDocumentsController(
          documentManagementService as unknown as DocumentManagementService
      );

      const routeLayer = router.stack.find(
          (layer: any) =>
              layer.route &&
              layer.route.path === paths.common.documentsPage &&
              layer.route.methods.get
      );

      expect(routeLayer).to.exist;
    });

    it('should register getDocuments as the GET route handler', () => {
      const router = setupDocumentsController(
          documentManagementService as unknown as DocumentManagementService
      );

      const routeLayer = router.stack.find(
          (layer: any) =>
              layer.route &&
              layer.route.path === paths.common.documentsPage &&
              layer.route.methods.get
      );

      expect(routeLayer).to.exist;
      expect(routeLayer.route.stack[0].handle).to.equal(getDocuments);
    });

    it('should register the document download GET route', () => {
      const router = setupDocumentsController(
          documentManagementService as unknown as DocumentManagementService
      );

      const routeLayer = router.stack.find(
          (layer: any) =>
              layer.route &&
              layer.route.path === paths.common.documentDownload &&
              layer.route.methods.get
      );

      expect(routeLayer).to.exist;
    });
  });
});