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

    it('calls next with the error instead of rendering when headers were already sent', () => {
      const err = new Error('Service is unavailable');
      const nextSpy = sinon.spy();
      res.headersSent = true;

      serverErrorHandler(err, req as Request, res as Response, nextSpy as NextFunction);

      expect(nextSpy.calledOnceWith(err)).to.equal(true);
      expect(resRenderSpy.called).to.equal(false);
    });

    it('sends the rendered html when the error view renders successfully', () => {
      const err = new Error('Service is unavailable');
      const sendSpy = sinon.spy();
      res.send = sendSpy;
      // Fake res.render(view, options, callback): immediately call the callback,
      // the same way Express would once the template has finished rendering.
      res.render = sinon.stub().callsFake((view, options, callback) => callback(null, '<html>500 page</html>'));

      serverErrorHandler(err, req as Request, res as Response, next);

      expect(sendSpy.calledOnceWith('<html>500 page</html>')).to.equal(true);
    });

    it('falls back to a generic message when the error view itself fails to render', () => {
      const err = new Error('Service is unavailable');
      const sendSpy = sinon.spy();
      res.status = sinon.stub().returns({ send: sendSpy });
      const renderErr = new Error('template blew up');
      res.render = sinon.stub().callsFake((view, options, callback) => callback(renderErr, undefined));

      serverErrorHandler(err, req as Request, res as Response, next);

      expect((res.status as sinon.SinonStub).calledWith(StatusCodes.INTERNAL_SERVER_ERROR)).to.equal(true);
      expect(sendSpy.calledOnceWith('Sorry, something went wrong. Please try again later.')).to.equal(true);
    });
  });
});

export {};
