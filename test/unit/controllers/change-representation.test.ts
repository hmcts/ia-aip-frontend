import { NextFunction, Request, Response, Router } from 'express';
import {
  getChangeRepresentation,
  getChangeRepresentationDownload,
  setupChangeRepresentationControllers
} from '../../../app/controllers/changing-representation';
import { paths } from '../../../app/paths';
import { DocmosisService } from '../../../app/service/docmosis-service';
import { expect, sinon } from '../../utils/testUtils';

describe('Change Representation Controller', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

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
    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      locals: {}
    } as Partial<Response>;
    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should setup the routes', () => {
    const routerStub: sinon.SinonStub = sandbox.stub(Router as never, 'get');
    const middleware: Middleware[] = [];
    setupChangeRepresentationControllers(middleware);
    expect(routerStub).to.have.been.calledWith(paths.common.changeRepresentation);
    expect(routerStub).to.have.been.calledWith(paths.common.changeRepresentationDownload);
  });

  it('getChangeRepresentation should render change-representation.njk', () => {
    getChangeRepresentation()(req as Request, res as Response, next);
    expect(res.render).to.have.been.calledOnce.calledWith('change-representation.njk', {
      onlineCaseReferenceNumber: '5827-8410-0185-6205',
      appellantGivenNames: 'Pedro',
      appellantFamilyName: 'Jimenez',
      appellantDateOfBirth: '31 December 1980'
    });
  });

  it('getChangeRepresentationDownload should return PDF', () => {
    sandbox.stub(DocmosisService.prototype,'render').returns({ success: true, document: Buffer.from('pdf-file', 'binary') });
    getChangeRepresentationDownload()(req as Request, res as Response, next);
  });
});
