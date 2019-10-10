import { NextFunction, Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import { pageNotFoundHandler, serverErrorHandler } from '../../../app/handlers/error-handler';
import Logger from '../../../app/utils/logger';
import { expect, sinon } from '../../utils/testUtils';

describe('Error Handler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {

    req = {
      app: {
        locals: {
          logger
        }
      } as any
    } as Partial<Request>;

    res = {
      status: sinon.spy(),
      render: sinon.spy(),
      send: sinon.spy(),
      type: sinon.spy()
    } as Partial<Response>;

  });

  describe('pageNotFoundHandler', () => {
    it('gives 404 page in HTML', () => {
      req.headers = { accept: 'text/html' };

      pageNotFoundHandler(req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.njk');
    });

    it('gives 404 page in JSON', () => {
      req.headers = { accept: 'application/json' };

      pageNotFoundHandler(req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.send).to.have.been.calledOnce.calledWith({ error: NOT_FOUND, message: 'Page not found' });
    });

    it('gives 404 page in text', () => {
      req.headers = { accept: 'text' };

      pageNotFoundHandler(req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.send).to.have.been.calledOnce.calledWith('Page not found');
    });
  });

  describe('serverErrorHandler', () => {
    it('gives 500 page in html', () => {
      req.headers = { accept: 'text/html' };
      const err = new Error('Service is unavailable');
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/500.njk');
    });

    it('gives 500 page in JSON', () => {
      req.headers = { accept: 'application/json' };
      const err = new Error('Service is unavailable');
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.send).to.have.been.calledOnce.calledWith({
        error: INTERNAL_SERVER_ERROR,
        message: 'Service unavailable'
      });
    });

    it('gives 500 page in text', () => {
      req.headers = { accept: 'text' };
      const err = new Error('Service is unavailable');
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.send).to.have.been.calledOnce.calledWith('Service unavailable');
    });
  });
});

export {};
