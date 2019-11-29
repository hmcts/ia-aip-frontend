import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { paths } from '../paths';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
      // Check session data if isLate is true then return true else return late
    const { application } = req.session.appeal;
    const isLate = () => application.isAppealLate === true;

    // tslint:disable-next-line:no-console
    console.log(req);
    const daysToWaitUntilContact = (days: number) => {
      const date = moment().add(days,'days').format('Do MMMM YYYY');
      return date;
    };
    res.render('confirmation-page.njk', {
      date: daysToWaitUntilContact,
      days: 14,
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
