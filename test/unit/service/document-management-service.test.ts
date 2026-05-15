import { Request } from 'express';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CdamDocumentManagementService } from '../../../app/service/cdam-document-management-service';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import IdamService from '../../../app/service/idam-service';
import S2SService from '../../../app/service/s2s-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('document-management-service', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      session: {
        appeal: {
          application: {
            contactDetails: {}
          }
        }
      } as Partial<Appeal>,
      cookies: {},
      idam: {
        userDetails: {
          uid: 'anUID'
        } as Partial<IdamDetails>
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('DocumentManagementService uploadFile', () => {
    it('should call CDAM', async () => {

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'uploadFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.uploadFile(req as Request);

      expect(cdamStub.calledWith(req)).to.equal(true);
    });
  });

  describe('DocumentManagementService deleteFile', () => {
    it('should call CDAM', async () => {

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'deleteFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.deleteFile(req as Request, 'file.id');

      expect(cdamStub.calledWith(req, 'file.id')).to.equal(true);
    });
  });

  describe('DocumentManagementService fetchFile', () => {
    it('should call CDAM', async () => {

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'fetchFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.fetchFile(req as Request, 'file.location');

      expect(cdamStub.calledWith(req, 'file.location')).to.equal(true);
    });
  });
});
