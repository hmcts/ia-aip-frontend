import { Request, Response } from 'express';
import * as refDataApi from '../../../app/api/ref-data-api';
import { AuthenticationService } from '../../../app/service/authentication-service';
import RefDataService from '../../../app/service/ref-data-service';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Ref Data Service', () => {
  let authenticationService: Partial<AuthenticationService>;
  let refDataService: RefDataService;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let commonRefDataLovStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  const refDataResponse = {
    data: {
      'list_of_values': [
        {
          'category_key': 'InterpreterLanguage',
          'key': 'hun',
          'value_en': 'Hungarian',
          'value_cy': '',
          'hint_text_en': '',
          'hint_text_cy': '',
          'lov_order': null,
          'parent_category': '',
          'parent_key': '',
          'active_flag': 'Y',
          'child_nodes': null
        }
      ]
    }
  };

  const logger: Logger = new Logger();
  let headersStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    headersStub = sandbox.stub();
    authenticationService = {
      getSecurityHeaders: headersStub.resolves()
    };
    refDataService = new RefDataService(authenticationService as AuthenticationService);
    commonRefDataLovStub = sandbox.stub(refDataApi, 'commonRefDataLov').resolves(refDataResponse);
    req = {
      app: {
        locals: {
          logger
        }
      } as any,
      idam: {
        userDetails: {
          uid: 'theUID'
        }
      },
      cookies: {
        '__auth-token': 'atoken'
      },
      session: {
        appeal: {
          ccdCaseId: 'aCcdCaseId'
        }
      }
    } as Partial<Request>;
    res = {
      redirect: sandbox.spy()
    } as Partial<Response>;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get common ref data (e.g. InterpreterLanguage)', async() => {
    const result = await refDataService.getCommonRefData(req as Request, 'InterpreterLanguage');

    expect(headersStub.called).to.equal(true);
    expect(commonRefDataLovStub.called).to.equal(true);
    expect(result).to.deep.equal(JSON.stringify(refDataResponse.data));
  });
});
