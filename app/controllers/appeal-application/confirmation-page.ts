import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';

const daysToWaitAfterSubmission: number = config.get('daysToWait.afterSubmission');

import { paths } from '../../paths';
import { addDaysToDate } from '../../utils/date-utils';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { application, paAppealTypeAipPaymentOption = null } = req.session.appeal;
    const isLate = () => application.isAppealLate;
    const payLater = paAppealTypeAipPaymentOption === 'payLater';

    res.render('confirmation-page.njk', {
      date: addDaysToDate(daysToWaitAfterSubmission),
      late: isLate(),
      payLater
    });
  } catch (e) {
    next(e);
  }
}

function setConfirmationController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.appealSubmitted.confirmation, middleware, getConfirmationPage);
  return router;
}

export {
  setConfirmationController,
  getConfirmationPage
};
