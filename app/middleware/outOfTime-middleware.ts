import { NextFunction, Response } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../paths';

function appealOutOfTimeMiddleware(req: Request<Params>, res: Response, next: NextFunction) {
  const application = req.session.appeal.application;
  if (application.isAppealLate) {
    if (!application.lateAppeal || !application.lateAppeal.reason) {
      return res.redirect(paths.appealStarted.appealLate);
    }
  }
  return next();
}

export {
  appealOutOfTimeMiddleware
};
