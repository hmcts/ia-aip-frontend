import { NextFunction, Request, Response } from 'express';
import { getDocuments } from '../../../../../app/controllers/documents-page';
import { expect, sinon } from '../../../../utils/testUtils';

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
        documents: [
          {
            name: 'Notice of Hearing',
            url: '/documents/notice-of-hearing'
          },
          {
            name: 'Appeal Documents',
            url: '/documents/appeal-documents'
          },
          {
            name: 'Supporting Evidence',
            url: '/documents/supporting-evidence'
          }
        ]
      };

      getDocuments(req as Request, res as Response, next);

      expect(renderStub).to.be.calledWith('documents.njk', {
        ...expectedRenderPayload
      });
    });

    it('should catch an error and pass it to next', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getDocuments(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });
});