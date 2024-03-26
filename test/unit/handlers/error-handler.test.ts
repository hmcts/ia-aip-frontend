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
      pageNotFoundHandler(req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.njk');
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

    it('it renders with callback error text if present', () => {
      req.headers = { accept: 'text/html' };
      const err = {
        message: 'Unable to proceed because there are one or more callback Errors or Warnings',
        path: 'types/Asylum/cases/1711014762394848/events',
        error: {
          details: null,
          callbackErrors: ['You cannot request a fee remission at this time because another fee remission request for this appeal has yet to be decided.'],
          callbackWarnings: [],
          timestamp: '2024-03-25T14:40:23.313274765'
        }
      };
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/500.njk', {
        err,
        callBackErrors: 'You cannot request a fee remission at this time because another fee remission request for this appeal has yet to be decided.'
      });
    });

    it('it renders without callback error text if not present', () => {
      req.headers = { accept: 'text/html' };
      const err = {
        message: 'Unable to proceed because there are one or more callback Errors or Warnings',
        path: 'types/Asylum/cases/1711014762394848/events',
        error: {
          details: null,
          callbackWarnings: [],
          timestamp: '2024-03-25T14:40:23.313274765'
        }
      };
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/500.njk', {
        err,
        callBackErrors: ''
      });
    });

    it('it renders with callback error texts if present multiple errors', () => {
      req.headers = { accept: 'text/html' };
      const err = {
        message: 'Unable to proceed because there are one or more callback Errors or Warnings',
        path: 'types/Asylum/cases/1711014762394848/events',
        error: {
          details: null,
          callbackErrors: ['Text 1.', 'Text 2.', 'Text 3.'],
          callbackWarnings: [],
          timestamp: '2024-03-25T14:40:23.313274765'
        }
      };
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/500.njk', {
        err,
        callBackErrors: 'Text 1. Text 2. Text 3.'
      });
    });
  });
});

export {};
