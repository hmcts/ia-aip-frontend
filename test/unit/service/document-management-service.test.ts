import { Request } from 'express';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { addToDocumentMapper, documentIdToDocStoreUrl, DocumentManagementService, removeFromDocumentMapper } from '../../../app/service/document-management-service';
import IdamService from '../../../app/service/idam-service';
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

  describe('DocumentManagementService deleteFile', () => {
    it('should delete a file and remove it from documentMap', async () => {
      req.session.appeal.documentMap = [
        {
          id: 'fileId',
          url: 'file-url.com'
        }
      ];
      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const deleteStub = sandbox.stub(DocumentManagementService.prototype, 'delete' as any);
      const documentManagementService = new DocumentManagementService(authenticationService);
      await documentManagementService.deleteFile(req as Request, 'fileId');

      expect(deleteStub).to.have.been.calledWith('anUID', sinon.match.any, 'file-url.com');
      expect(req.session.appeal.documentMap.length).to.be.eq(0);
    });

  });

  describe('Helper methods @helper', () => {
    it('addToDocumentMapper should store url and return back a uuid', () => {

      const documentMap: DocumentMap[] = [];
      const documentUrl: string = 'http://documenturl/';

      const result = addToDocumentMapper(documentUrl, documentMap);
      validateUuid(result);
    });

    it('documentMapToDocStoreUrl should retrieve the doc store url using key', () => {
      const documentMap: DocumentMap[] = [
        { id: '00000000-0000-0000-0000-000000000000', url: 'http://someDocumentUrl/' }
      ];
      const result = documentIdToDocStoreUrl('00000000-0000-0000-0000-000000000000', documentMap);
      expect(result).to.be.a('string');
      expect(result).to.be.eq('http://someDocumentUrl/');
    });

    describe('removeFromDocumentMapper', () => {
      it('should remove a document from DocumentMap when file is found', () => {
        req.session.appeal.documentMap = [
          {
            id: 'fileId',
            url: 'file-url.com'
          }
        ];
        const documentMap = removeFromDocumentMapper('fileId', req.session.appeal.documentMap);
        expect(documentMap.length).to.be.eq(0);
      });

      it('should leave documentMap as it is if document not found', () => {
        req.session.appeal.documentMap = [
          {
            id: 'fileId',
            url: 'file-url.com'
          }
        ];
        const documentMap = removeFromDocumentMapper('anotherId', req.session.appeal.documentMap);
        expect(documentMap.length).to.be.eq(1);
      });
    });
  });

});
