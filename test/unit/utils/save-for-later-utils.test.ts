import { NextFunction, Request, Response } from 'express';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { getNextPage, shouldValidateWhenSaveForLater } from '../../../app/utils/save-for-later-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('Save for later utils', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            lateAppeal: {}
          },
          caseBuilding: {},
          hearingRequirements: {}
        } as Appeal
      } as Partial<Express.Session>,
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
      redirect: sandbox.spy()
    } as Partial<Response>;

    next = sandbox.stub() as NextFunction;

    updateAppealService = { submitEvent: sandbox.stub() };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getNextPage', () => {
    it('get next page when save for later clicked', () => {
      const nextPage = getNextPage({ saveForLater: 'saveForLater' }, 'defaultPath', req as Request);

      expect(nextPage).to.eq(paths.overview);
    });

    it('get next page when save and continue clicked', () => {
      const nextPage = getNextPage({}, 'defaultPath', req as Request);

      expect(nextPage).to.eq('defaultPath');
    });
  });

  describe('shouldValidateWhenSaveForLater', () => {
    it('shouldValidateWhenSaveForLater is true when save for later not clicked', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ }, 'anyField');

      expect(shouldValidate).to.be.true;
    });

    it('shouldValidateWhenSaveForLater is true when save for later clicked and some data entered', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ saveForLater: 'saveForLater', field1: 'someValue' }, 'field1', 'field2');

      expect(shouldValidate).to.be.true;
    });

    it('shouldValidateWhenSaveForLater is false when save for later clicked and no data entered', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ saveForLater: 'saveForLater' }, 'field1', 'field2');

      expect(shouldValidate).to.be.false;
    });

    it('shouldValidateWhenSaveForLater is false when save for later clicked and data entered is blank', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ saveForLater: 'saveForLater', field1: '', field2: '' }, 'field1', 'field2');

      expect(shouldValidate).to.be.false;
    });
  });
});
