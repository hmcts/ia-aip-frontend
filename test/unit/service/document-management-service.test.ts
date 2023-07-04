import { Request } from 'express';
import rp from 'request-promise';
import { FEATURE_FLAGS } from '../../../app/data/constants';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CdamDocumentManagementService } from '../../../app/service/cdam-document-management-service';
import { DmDocumentManagementService } from '../../../app/service/dm-document-management-service';
import { DocumentManagementService } from '../../../app/service/document-management-service';
import IdamService from '../../../app/service/idam-service';
import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import S2SService from '../../../app/service/s2s-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon, validateUuid } from '../../utils/testUtils';

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

  describe('DocumentManagementService uploadFile feature flag', () => {
    it('should call CDAM when feature flag is on', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false).resolves(true);

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const dmStub = sandbox.stub(DmDocumentManagementService.prototype, 'uploadFile' as any);
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'uploadFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.uploadFile(req as Request);

      expect(dmStub).to.not.have.been.called;
      expect(cdamStub).to.have.been.called;
    });

    it('should call DM when feature flag is off', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false).resolves(false);

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const dmStub = sandbox.stub(DmDocumentManagementService.prototype, 'uploadFile' as any);
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'uploadFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.uploadFile(req as Request);

      expect(cdamStub).to.not.have.been.called;
      expect(dmStub).to.have.been.called;
    });
  });

  describe('DocumentManagementService deleteFile feature flag', () => {
    it('should call CDAM when feature flag is on', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false).resolves(true);

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const dmStub = sandbox.stub(DmDocumentManagementService.prototype, 'deleteFile' as any);
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'deleteFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.deleteFile(req as Request, 'file.id');

      expect(dmStub).to.not.have.been.called;
      expect(cdamStub).to.have.been.called;
    });

    it('should call DM when feature flag is off', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false).resolves(false);

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const dmStub = sandbox.stub(DmDocumentManagementService.prototype, 'deleteFile' as any);
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'deleteFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.deleteFile(req as Request, 'file.id');

      expect(cdamStub).to.not.have.been.called;
      expect(dmStub).to.have.been.called;
    });
  });

  describe('DocumentManagementService fetchFile feature flag', () => {
    it('should call CDAM when feature flag is on', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false).resolves(true);

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const dmStub = sandbox.stub(DmDocumentManagementService.prototype, 'fetchFile' as any);
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'fetchFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.fetchFile(req as Request, 'file.location');

      expect(dmStub).to.not.have.been.called;
      expect(cdamStub).to.have.been.called;
    });

    it('should call DM when feature flag is off', async () => {
      sandbox.stub(LaunchDarklyService.prototype, 'getVariation').withArgs(req as Request, FEATURE_FLAGS.USE_CCD_DOCUMENT_AM, false).resolves(false);

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const dmStub = sandbox.stub(DmDocumentManagementService.prototype, 'fetchFile' as any);
      const cdamStub = sandbox.stub(CdamDocumentManagementService.prototype, 'fetchFile' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.fetchFile(req as Request, 'file.location');

      expect(cdamStub).to.not.have.been.called;
      expect(dmStub).to.have.been.called;
    });
  });
});
