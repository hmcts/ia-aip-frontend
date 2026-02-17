import { Request, Response, Router } from 'express';
import { getChangeRepresentation, getChangeRepresentationDownload, setupChangeRepresentationControllers } from '../../../app/controllers/changing-representation';
import { paths } from '../../../app/paths';
import { DocmosisService } from '../../../app/service/docmosis-service';
import { expect, sinon } from '../../utils/testUtils';

describe('Change Representation Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;
  let send: sinon.SinonStub;
  let headerSpy: sinon.SinonSpy;
  let renderStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    send = sandbox.stub();
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
          ccdCaseId: '5827841001856205',
          application: {
            personalDetails: {
              givenNames: 'Pedro',
              familyName: 'Jimenez',
              dob: { year: '1980', month: '12', day: '31' }
            }
          },
          documentMap: []
        }
      }
    } as Partial<Request>;
    headerSpy = sandbox.spy();
    renderStub = sandbox.stub();
    res = {
      render: renderStub,
      send: send,
      setHeader: headerSpy
    } as Partial<Response>;
    next = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerStub: sinon.SinonStub = sandbox.stub(Router as never, 'get');
    const middleware: Middleware[] = [];
    setupChangeRepresentationControllers(middleware);
    expect(routerStub.calledWith(paths.common.changeRepresentation)).to.equal(true);
    expect(routerStub.calledWith(paths.common.changeRepresentationDownload)).to.equal(true);
  });

  describe('getChangeRepresentation', () => {
    it('should render change-representation.njk', () => {
      getChangeRepresentation()(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('change-representation.njk', {
        previousPage: paths.common.overview,
        onlineCaseReferenceNumber: '5827-8410-0185-6205',
        appellantGivenNames: 'Pedro',
        appellantFamilyName: 'Jimenez',
        appellantDateOfBirth: '31 December 1980'
      });
    });

    it('display reference number even if it is not 16 characters', () => {
      req.session.appeal.ccdCaseId = '582784100185620';
      getChangeRepresentation()(req as Request, res as Response, next);
      expect(renderStub).to.be.calledOnceWith('change-representation.njk', {
        previousPage: paths.common.overview,
        onlineCaseReferenceNumber: '582784100185620',
        appellantGivenNames: 'Pedro',
        appellantFamilyName: 'Jimenez',
        appellantDateOfBirth: '31 December 1980'
      });
    });

    it('should catch errors', () => {
      const error = new Error('the error');
      res.render = renderStub.throws(error);

      getChangeRepresentation()(req as Request, res as Response, next);

      expect(next.calledWith(error)).to.equal(true);
    });
  });

  describe('getChangeRepresentationDownload', () => {
    it('should send PDF', async () => {
      const pdf = Buffer.from('pdf-file', 'binary');
      const success = Promise.resolve({ success: true, document: pdf });
      sandbox.stub(DocmosisService.prototype,'render').returns(success);

      await getChangeRepresentationDownload()(req as Request, res as Response, next);

      expect(headerSpy.calledWith('content-type', 'application/pdf')).to.equal(true);
      expect(headerSpy.calledWith('content-disposition', 'attachment; filename="Notice of Change details.pdf"')).to.equal(true);
      expect(send.calledOnceWith(pdf)).to.equal(true);
    });

    it('should call next with error', async () => {
      const message = 'error-message';
      const failed = Promise.resolve({ success: false, error: message });
      sandbox.stub(DocmosisService.prototype,'render').returns(failed);

      await getChangeRepresentationDownload()(req as Request, res as Response, next);

      expect(next.calledOnceWith(message)).to.equal(true);
    });

    it('should catch errors', async () => {
      const error = new Error('error-message');
      sandbox.stub(DocmosisService.prototype,'render').throws(error);

      await getChangeRepresentationDownload()(req as Request, res as Response, next);

      expect(next.calledOnceWith(error)).to.equal(true);
    });
  });
});
