import { NextFunction, Request, Response } from 'express';
import { getDocuments, setupDocumentsController } from '../../../app/controllers/documents-page';
import { paths } from '../../../app/paths';
import { expect, sinon } from '../../utils/testUtils';

describe('Documents controllers setup', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let renderStub: sinon.SinonStub;

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

    renderStub = sandbox.stub();

    res = {
      render: renderStub,
      locals: {}
    } as Partial<Response>;

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

    it('should pass an error to next when rendering fails', () => {
      const error = new Error('the error');

      renderStub.throws(error);

      getDocuments(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnceWithExactly(error);
    });
  });

  describe('setupDocumentsController', () => {
    it('should create a router', () => {
      const router = setupDocumentsController();

      expect(router).to.exist;
    });

    it('should register the documents page GET route', () => {
      const router = setupDocumentsController();

      const routeLayer = router.stack.find(
        (layer: any) =>
          layer.route &&
          layer.route.path === paths.common.documentsPage &&
          layer.route.methods.get
      );

      expect(routeLayer).to.exist;
    });

    it('should register getDocuments as the GET route handler', () => {
      const router = setupDocumentsController();

      const routeLayer = router.stack.find(
        (layer: any) =>
          layer.route &&
          layer.route.path === paths.common.documentsPage &&
          layer.route.methods.get
      );

      expect(routeLayer).to.exist;
      expect(routeLayer.route.stack[0].handle).to.equal(getDocuments);
    });
  });
});