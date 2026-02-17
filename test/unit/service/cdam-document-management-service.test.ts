import axios from 'axios';
import { Request } from 'express';
import { AuthenticationService } from '../../../app/service/authentication-service';
import { CdamDocumentManagementService, CdamUploadData } from '../../../app/service/cdam-document-management-service';
import IdamService from '../../../app/service/idam-service';
import S2SService from '../../../app/service/s2s-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon, validateUuid } from '../../utils/testUtils';

const config = require('config');

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

      expect(deleteStub.calledWith(sinon.match.any, config.get('cdamDocumentManagement').apiUrl + '/cases/documents/ID')).to.equal(true);
      expect(req.session.appeal.documentMap.length).to.equal(0);
    });

  });

  describe('CdamDocumentManagementService fetchFile', () => {
    it('should fetch a file', async () => {
      const authenticationService: AuthenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      const fetchStub = sandbox.stub(CdamDocumentManagementService.prototype, 'fetchBinaryFile' as any);
      const documentManagementService = new CdamDocumentManagementService(authenticationService);
      await documentManagementService.fetchFile(req as Request, 'http://store/documents/ID');

      expect(fetchStub.calledWith(sinon.match.any, config.get('cdamDocumentManagement').apiUrl + '/cases/documents/ID/binary')).to.equal(true);
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

      expect(uploadStub.calledWith(sinon.match.any, sinon.match.any)).to.equal(true);
      expect(req.session.appeal.documentMap.length).to.equal(1);
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
        expect(documentMap.length).to.equal(0);
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
        expect(documentMap.length).to.equal(1);
      });
    });
  });

  describe('Private methods', () => {
    let documentManagementService: CdamDocumentManagementService;
    let authenticationService: AuthenticationService;

    beforeEach(() => {
      authenticationService = new AuthenticationService(new IdamService(), S2SService.getInstance());
      documentManagementService = new CdamDocumentManagementService(authenticationService);
    });

    describe('upload', () => {
      const fileMock = {
        fieldname: 'file',
        originalname: 'file.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 4,
        buffer: Buffer.from('test'),
        stream: {} as any,
        destination: '',
        filename: '',
        path: ''
      };
      it('should call axios.post with correct params and return stringified data', async () => {
        const axiosPostStub = sandbox.stub(axios, 'post').resolves({ data: { foo: 'bar' } });
        const formGetHeadersStub = sandbox.stub().returns({ 'content-type': 'multipart/form-data' });
        sandbox.stub(require('form-data').prototype, 'append').callsFake(sandbox.stub());
        sandbox.stub(require('form-data').prototype, 'getHeaders').callsFake(formGetHeadersStub);
        const headers = { userToken: 'user', serviceToken: 'service' };
        const uploadData = {
          file: fileMock,
          classification: 'RESTRICTED',
          caseTypeId: 'Asylum',
          jurisdictionId: 'IA'
        };
        const result = await documentManagementService['upload'](headers, uploadData as CdamUploadData);
        expect(axiosPostStub.callCount).to.equal(1);
        expect(result).to.eq(JSON.stringify({ foo: 'bar' }));
      });
      it('should throw if axios.post fails', async () => {
        sandbox.stub(require('axios'), 'post').rejects(new Error('fail'));
        const formGetHeadersStub = sandbox.stub().returns({});
        sandbox.stub(require('form-data').prototype, 'getHeaders').callsFake(formGetHeadersStub);
        const headers = { userToken: 'user', serviceToken: 'service' };
        const uploadData = {
          file: fileMock,
          classification: 'RESTRICTED',
          caseTypeId: 'Asylum',
          jurisdictionId: 'IA'
        };
        expect(documentManagementService['upload'](headers, uploadData as CdamUploadData)).to.be.rejectedWith('fail');
      });
    });

    describe('delete', () => {
      it('should call axios.delete with correct params', async () => {
        const axiosDeleteStub = sandbox.stub(require('axios'), 'delete').resolves({ status: 204 });
        const headers = { userToken: 'user', serviceToken: 'service' };
        const fileLocation = 'http://file/location';
        const result = await documentManagementService['delete'](headers, fileLocation);
        expect(axiosDeleteStub.calledWith(fileLocation, sinon.match.any)).to.equal(true);
        expect(result).to.deep.equal({ status: 204 });
      });
      it('should throw if axios.delete fails', async () => {
        sandbox.stub(require('axios'), 'delete').rejects(new Error('fail'));
        const headers = { userToken: 'user', serviceToken: 'service' };
        const fileLocation = 'http://file/location';
        expect(documentManagementService['delete'](headers, fileLocation)).to.be.rejectedWith('fail');
      });
    });

    describe('fetchBinaryFile', () => {
      it('should call axios.get with correct params and responseType', async () => {
        const axiosGetStub = sandbox.stub(require('axios'), 'get').resolves({ data: Buffer.from('binary') });
        const headers = { userToken: 'user', serviceToken: 'service' };
        const fileLocation = 'http://file/location';
        const result = await documentManagementService['fetchBinaryFile'](headers, fileLocation);
        expect(axiosGetStub.calledWith(fileLocation, sinon.match.hasNested('responseType', 'arraybuffer'))).to.equal(true);
        expect(result).to.deep.equal({ data: Buffer.from('binary') });
      });
      it('should throw if axios.get fails', async () => {
        sandbox.stub(require('axios'), 'get').rejects(new Error('fail'));
        const headers = { userToken: 'user', serviceToken: 'service' };
        const fileLocation = 'http://file/location';
        expect(documentManagementService['fetchBinaryFile'](headers, fileLocation)).to.be.rejectedWith('fail');
      });
    });
  });
});
