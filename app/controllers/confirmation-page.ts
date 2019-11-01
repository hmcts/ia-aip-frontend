import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { paths } from '../paths';

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    const date = moment().add(14,'days').format('Do MMMM YYYY');
    res.render('confirmation-page.njk', { date: date });
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
