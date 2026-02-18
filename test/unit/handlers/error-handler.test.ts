import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { pageNotFoundHandler, serverErrorHandler } from '../../../app/handlers/error-handler';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Error Handler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();
  let resStatusSpy: sinon.SinonSpy;
  let resRenderSpy: sinon.SinonSpy;
  beforeEach(() => {

    req = {
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;
    resStatusSpy = sinon.spy();
    resRenderSpy = sinon.spy();
    res = {
      status: resStatusSpy,
      render: resRenderSpy,
      send: sinon.spy(),
      type: sinon.spy()
    } as Partial<Response>;

  });

  describe('pageNotFoundHandler', () => {
    it('gives 404 page in HTML', () => {
      pageNotFoundHandler(req as Request, res as Response, next);

      expect(resStatusSpy.calledOnceWith(StatusCodes.NOT_FOUND)).to.equal(true);
      expect(resRenderSpy.calledOnceWith('errors/404.njk')).to.equal(true);
    });
  });

  describe('serverErrorHandler', () => {
    it('gives 500 page in html', () => {
      req.headers = { accept: 'text/html' };
      const err = new Error('Service is unavailable');
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(resStatusSpy.calledOnceWith(StatusCodes.INTERNAL_SERVER_ERROR)).to.equal(true);
      expect(resRenderSpy.calledOnceWith('errors/500.njk')).to.equal(true);
    });
  });
});

export {};
