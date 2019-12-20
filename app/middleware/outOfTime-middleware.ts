import { NextFunction, Request, Response } from 'express';
import { paths } from '../paths';

function appealOutOfTimeMiddleware(req: Request, res: Response, next: NextFunction) {
  const application = req.session.appeal.application;
  if (application.isAppealLate) {
    if (!application.lateAppeal || !application.lateAppeal.reason) {
      return res.redirect(paths.homeOffice.appealLate);
    }
  }
  return next();
}

export {
  appealOutOfTimeMiddleware
};
