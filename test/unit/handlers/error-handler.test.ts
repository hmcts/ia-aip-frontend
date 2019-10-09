import { INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import { expect, sinon } from '../../utils/testUtils';
import { pageNotFoundHandler, serverErrorHandler } from '../../../app/handlers/error-handler';

describe('Error Handler', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {

    req = {};
    res = {
      status: sinon.spy(),
      render: sinon.spy(),
      send: sinon.spy(),
      type: sinon.spy()
    };

  });

  describe('pageNotFoundHandler', () => {
    it('gives 404 page in HTML', () => {
      req.headers = { accept: 'text/html' };

      pageNotFoundHandler(req, res, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/404.html');
    });

    it('gives 404 page in JSON', () => {
      req.headers = { accept: 'application/json' };

      pageNotFoundHandler(req, res, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.send).to.have.been.calledOnce.calledWith({ error: NOT_FOUND, message: 'Page not found' });
    });

    it('gives 404 page in text', () => {
      req.headers = { accept: 'text' };

      pageNotFoundHandler(req, res, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.send).to.have.been.calledOnce.calledWith('Page not found');
    });
  });

  describe('serverErrorHandler', () => {
    it('gives 500 page in html', () => {
      req.headers = { accept: 'text/html' };
      const err = new Error('Service is unavailable');
      serverErrorHandler(err, req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.render).to.have.been.calledOnce.calledWith('errors/500.html');
    });

    it('gives 500 page in JSON', () => {
      req.headers = { accept: 'application/json' };
      const err = new Error('Service is unavailable');
      serverErrorHandler(err, req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.send).to.have.been.calledOnce.calledWith({ error: INTERNAL_SERVER_ERROR, message: 'Service unavailable' });
    });

    it('gives 500 page in text', () => {
      req.headers = { accept: 'text' };
      const err = new Error('Service is unavailable');
      serverErrorHandler(err, req, res, next);
      expect(res.status).to.have.been.calledOnce.calledWith(INTERNAL_SERVER_ERROR);
      expect(res.send).to.have.been.calledOnce.calledWith('Service unavailable');
    });
  });
});

export {};
