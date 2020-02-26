import { Request } from 'express';
import { addToDocumentMapper, documentMapToDocStoreUrl } from '../../../app/service/document-management-service';
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
        userDetails: {} as Partial<IdamDetails>
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

  describe('Helper methods', () => {
    it('addToDocumentMapper should store url and return back a uuid', async () => {

      const documentMap: DocumentMap[] = [];
      const documentUrl: string = 'http://documenturl/';

      const result = addToDocumentMapper(documentUrl, documentMap);
      expect(result).to.be.a.uuid();
    });

    it('documentMapToDocStoreUrl should retrieve the doc store url using key', async () => {
      const documentMap: DocumentMap[] = [
        { id: '00000000-0000-0000-0000-000000000000', url: 'http://someDocumentUrl/' }
      ];
      const result = documentMapToDocStoreUrl('00000000-0000-0000-0000-000000000000', documentMap);
      expect(result).to.be.a('string');
      expect(result).to.be.eq('http://someDocumentUrl/');
    });
  });
});
