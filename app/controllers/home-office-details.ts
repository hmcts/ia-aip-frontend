import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { dateValidation, homeOfficeNumberValidation } from '../utils/fields-validations';

function getHomeOfficeDetails(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/home-office-details.njk', { application: req.session.appealApplication });
  } catch (e) {
    next(e);
  }
}

function postHomeOfficeDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const homeOfficeDetails = req.body['homeOfficeRefNumber'];
    const validation = homeOfficeNumberValidation(homeOfficeDetails);
    if (validation) {
      return res.render('appeal-application/home-office-details.njk',
        {
          error: validation,
          application: req.session.appealApplication
        }
      );
    }

    req.session.appealApplication['homeOfficeReference'] = homeOfficeDetails;
    return res.redirect(paths.homeOfficeLetterSent);
  } catch (e) {
    next(e);
  }
}

function getDateLetterSent(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/home-office-letter-sent.njk');
  } catch (e) {
    next(e);
  }
}

function postDateLetterSent(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = dateValidation(req.body);
    if (validation) {
      return res.render('appeal-application/home-office-letter-sent.njk', {
        error: validation,
        errorList: Object.values(validation)
      });
    }
    req.session.appealApplication['homeOfficeDateLetterSent'] = {
      day: req.body['day'],
      month: req.body['month'],
      year: req.body['year']
    };
    res.render('appeal-application/home-office-letter-sent.njk', { application: req.session.appealApplication });
  } catch (e) {
    next(e);
  }
}

function setupHomeOfficeDetailsController(): Router {
  const router = Router();
  router.get(paths.homeOfficeDetails, getHomeOfficeDetails);
  router.post(paths.homeOfficeDetails, postHomeOfficeDetails);
  router.get(paths.homeOfficeLetterSent, getDateLetterSent);
  router.post(paths.homeOfficeLetterSent, postDateLetterSent);
  return router;
}

export {
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterSent,
  postHomeOfficeDetails,
  setupHomeOfficeDetailsController
};
