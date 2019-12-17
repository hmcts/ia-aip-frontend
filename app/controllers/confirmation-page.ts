import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';

import { paths } from '../paths';

export const daysToWaitUntilContact = (days: number) => {
  const date = moment().add(days,'days').format('DD MMMM YYYY');
  return date;
};
function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const isLate = () => application.isAppealLate ;

    res.render('confirmation-page.njk', {
      date: daysToWaitUntilContact(14),
      late: isLate()
    });
  } catch (e) {
    next(e);
  }
}

function setConfirmationController(): Router {
  const router = Router();
  router.get(paths.confirmation, getConfirmationPage);
  return router;
}

export {
  setConfirmationController,
  getConfirmationPage
};
