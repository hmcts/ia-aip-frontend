import { Request } from 'express';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CdamDocumentManagementService } from '../../../app/service/cdam-document-management-service';
import IdamService from '../../../app/service/idam-service';
import S2SService from '../../../app/service/s2s-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon, validateUuid } from '../../utils/testUtils';

describe('cdam-document-management-service', () => {
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
          },
          documentMap: []
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

  describe('CdamDocumentManagementService deleteFile', () => {
    it('should delete a file and remove it from documentMap', async () => {
      req.session.appeal.documentMap = [
        {
          id: 'fileId',
          url: 'http://store/documents/ID'
        }
      ];
      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const deleteStub = sandbox.stub(CdamDocumentManagementService.prototype, 'delete' as any);
      const documentManagementService = new CdamDocumentManagementService(authenticationService);
      await documentManagementService.deleteFile(req as Request, 'fileId');

      expect(deleteStub).to.have.been.calledWith(sinon.match.any, 'CASE_DOCUMENT_AM_URL/cases/documents/ID');
      expect(req.session.appeal.documentMap.length).to.be.eq(0);
    });

  });

  describe('CdamDocumentManagementService fetchFile', () => {
    it('should fetch a file', async () => {
      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const fetchStub = sandbox.stub(CdamDocumentManagementService.prototype, 'fetchBinaryFile' as any);
      const documentManagementService = new CdamDocumentManagementService(authenticationService);
      await documentManagementService.fetchFile(req as Request, 'http://store/documents/ID');

      expect(fetchStub).to.have.been.calledWith(sinon.match.any, 'CASE_DOCUMENT_AM_URL/cases/documents/ID/binary');
    });

  });

  describe('CdamDocumentManagementService uploadFile', () => {
    it('should upload a file', async () => {
      req.session.appeal.documentMap = [];

      const documentUploadResponse = '{"documents":[{"originalDocumentName":"file.txt","_links":{"self":{"href":"http://store/documents/doc-id"}}}]}';

      const resolved = new Promise((r) => r(documentUploadResponse));

      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const uploadStub = sandbox.stub(CdamDocumentManagementService.prototype, 'upload' as any).returns(resolved);
      const documentManagementService = new CdamDocumentManagementService(authenticationService);
      await documentManagementService.uploadFile(req as Request);

      expect(uploadStub).to.have.been.calledWith(sinon.match.any, sinon.match.any);
      expect(req.session.appeal.documentMap.length).to.be.eq(1);
    });

  });

  describe('Helper methods @helper', () => {
    it('addToDocumentMapper should store url and return back a uuid', () => {

      const documentMap: DocumentMap[] = [];
      const documentUrl: string = 'http://documenturl/';

      const documentManagementService = new CdamDocumentManagementService(null);
      const result = documentManagementService.addToDocumentMapper(documentUrl, documentMap);
      validateUuid(result);
    });

    describe('removeFromDocumentMapper', () => {
      it('should remove a document from DocumentMap when file is found', () => {
        req.session.appeal.documentMap = [
          {
            id: 'fileId',
            url: 'file-url.com'
          }
        ];
        const documentManagementService = new CdamDocumentManagementService(null);
        const documentMap = documentManagementService.removeFromDocumentMapper('fileId', req.session.appeal.documentMap);
        expect(documentMap.length).to.be.eq(0);
      });

      it('should leave documentMap as it is if document not found', () => {
        req.session.appeal.documentMap = [
          {
            id: 'fileId',
            url: 'file-url.com'
          }
        ];
        const documentManagementService = new CdamDocumentManagementService(null);
        const documentMap = documentManagementService.removeFromDocumentMapper('anotherId', req.session.appeal.documentMap);
        expect(documentMap.length).to.be.eq(1);
      });
    });
  });

});
