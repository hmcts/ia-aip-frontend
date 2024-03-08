import { NextFunction, Request, Response } from 'express';
import Logger from '../../../app/utils/logger';
import {
  addQueryParam,
  appealHasNoRemissionOption,
  appealHasRemissionOption, readQueryParam
} from '../../../app/utils/remission-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('Remission fields utils', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
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
        userDetails: {}
      },
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      render: sandbox.stub(),
      send: sandbox.stub(),
      redirect: sinon.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('appeal has remission option', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.application.remissionOption = 'asylumSupportFromHo';

    const remissionOptiondata = [
      {
        remissionOption: 'asylumSupportFromHo',
        expectedResponse: true,
        description: 'asylumSupportFromHo option selected'
      },
      {
        remissionOption: 'feeWaiverFromHo',
        expectedResponse: true,
        description: 'feeWaiverFromHo option selected'
      },
      {
        remissionOption: 'under18GetSupportFromLocalAuthority',
        expectedResponse: true,
        description: 'under18GetSupportFromLocalAuthority option selected'
      },
      {
        remissionOption: 'parentGetSupportFromLocalAuthority',
        expectedResponse: true,
        description: 'parentGetSupportFromLocalAuthority option selected'
      },
      {
        remissionOption: 'noneOfTheseStatements',
        expectedResponse: false,
        description: 'noneOfTheseStatements option selected'
      }
    ];

    remissionOptiondata.forEach(({ remissionOption, expectedResponse, description }) => {
      it(`should be ${description}`, () => {
        appeal.application.remissionOption = remissionOption;
        expect(appealHasRemissionOption(appeal.application)).to.be.deep.equal(expectedResponse);
      });
    });
  });

  it('appeal has no remission option', () => {
    const { appeal } = req.session;
    appeal.application.appealType = 'protection';
    appeal.application.remissionOption = 'noneOfTheseStatements';
    appeal.application.helpWithFeesOption = 'willPayForAppeal';

    expect(appealHasNoRemissionOption(appeal.application)).to.be.deep.equal(true);
  });

  it('should add query param', () => {
    const url = 'http://localhost:3000';
    const queryParam = 'saved';
    const expectedUrl = 'http://localhost:3000?saved';
    expect(addQueryParam(url, queryParam)).to.be.deep.equal(expectedUrl);
  });

  it('should read query param', () => {
    const url = 'http://localhost:3000?saved';
    const queryParam = 'saved';
    expect(readQueryParam(url)).to.be.deep.equal(queryParam);
  });

});
