import express, { NextFunction, Request, Response } from 'express';
import {
  getConfirmationPage,
  setConfirmationRefundController
} from '../../../../app/controllers/ask-for-fee-remission/confirmation-page';
import { paths } from '../../../../app/paths';
import { addDaysToDate } from '../../../../app/utils/date-utils';
import Logger from '../../../../app/utils/logger';
import { expect, sinon } from '../../../utils/testUtils';

describe('Ask for a refund confirmation page Controller', function () {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      session: {
        appeal: {
          application: {
            isAppealLate: false
          }
        }
      } as Partial<Express.Session>,
      cookies: {
        '__auth-token': 'atoken'
      },
      idam: {
        userDetails: {
          uid: 'idamUID'
        }
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
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('setConfirmationRefundController', () => {

    it('should setup the routes', () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(express.Router as never, 'get');
      const middleware = [];

      setConfirmationRefundController(middleware);
      expect(routerGetStub).to.have.been.calledWith(paths.appealSubmitted.confirmationRefund);
    });

    it('getConfirmationPage should render confirmation-page.njk after submission', () => {
      getConfirmationPage(req as Request, res as Response, next);
      expect(res.render).to.have.been.calledOnce.calledWith('ask-for-fee-remission/confirmation-page.njk', {
        date: addDaysToDate(14)
      });
    });
  });

});
