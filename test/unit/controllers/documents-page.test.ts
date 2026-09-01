import { NextFunction, Request, Response } from 'express';
import { getDocuments } from '../../../app/controllers/documents-page';
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
      getDocuments(req as Request, res as Response, next);

      expect(renderStub).to.have.been.calledOnce;
      expect(renderStub).to.have.been.calledWith(
        'documents/documents.njk',
        {
          title: 'Documents',
          documents: []
        }
      );
    });

    it('should render the documents page with an empty documents list', () => {
      getDocuments(req as Request, res as Response, next);

      const renderArguments = renderStub.firstCall.args;

      expect(renderArguments[0]).to.equal('documents.njk');
      expect(renderArguments[1]).to.deep.equal({
        title: 'Documents',
        documents: []
      });
    });

    it('should set the page title to Documents', () => {
      getDocuments(req as Request, res as Response, next);

      expect(renderStub.firstCall.args[1].title).to.equal('Documents');
    });

    it('should set documents to an empty array', () => {
      getDocuments(req as Request, res as Response, next);

      expect(renderStub.firstCall.args[1].documents).to.deep.equal([]);
    });

    it('should not call next when the page renders successfully', () => {
      getDocuments(req as Request, res as Response, next);

      expect(next).to.not.have.been.called;
    });

    it('should pass the error to next when rendering fails', () => {
      const error = new Error('the error');

      renderStub.throws(error);

      getDocuments(req as Request, res as Response, next);

      expect(next).to.have.been.calledOnceWithExactly(error);
    });
  });
});