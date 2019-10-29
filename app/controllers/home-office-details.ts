import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import multer from 'multer';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import {
  dateValidation,
  homeOfficeNumberValidation,
  textAreaValidation
} from '../utils/fields-validations';

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
    const { day, month, year } = req.body;
    const diffInDays = moment().diff(moment(`${year} ${month} ${day}`, 'YYYY MM DD'), 'days');
    if (diffInDays < 0) {
      const error = {
        text: i18n.validationErrors.futureDate,
        href: '#day'
      };
      return res.render('appeal-application/home-office-letter-sent.njk', {
        errorList: [ error ]
      });
    }

    req.session.appealApplication['homeOfficeDateLetterSent'] = {
      day,
      month,
      year
    };

    if (diffInDays <= 14) return res.redirect(paths.taskList);
    res.redirect(paths.homeOfficeAppealLate);
  } catch (e) {
    next(e);
  }
}

function getAppealLate(req: Request, res: Response, next: NextFunction) {
  try {
    const appealLate: string = req.session.appealApplication && req.session.appealApplication['appeal-late'] || null;
    const evidences = req.session.appealApplication && req.session.appealApplication.files || null;
    res.render('appeal-application/home-office-appeal-late.njk', { appealLate, evidences });
  } catch (e) {
    next(e);
  }
}

function postAppealLate(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.file) {
      req.session.appealApplication = {
        ...req.session.appealApplication,
        files: {
          ...req.session.appealApplication.files,
          [req.file.originalname]: {
            file_name: req.file.originalname,
            value: req.file.mimetype
          }
        }
      };
      const appealLate: string = req.session.appealApplication['appeal-late'] || null;
      const evidences = req.session.appealApplication.files;
      return res.render('appeal-application/home-office-appeal-late.njk', { appealLate, evidences: Object.values(evidences) });
    } else if (req.body.delete) {
      const fileId = Object.keys(req.body.delete)[0];
      delete req.session.appealApplication.files[fileId];
      return res.redirect(paths.homeOfficeAppealLate);
    }
    const validation = textAreaValidation(req.body['appeal-late'], 'appeal-late');
    const evidences = req.session.appealApplication.files || {};
    if (validation) {
      return res.render('appeal-application/home-office-appeal-late.njk', {
        appealLate: req.body['appeal-late'],
        evidences: Object.values(evidences),
        error: validation,
        errorList: Object.values(validation)
      });
    }
    req.session.appealApplication = {
      ...req.session.appealApplication,
      'appeal-late': req.body['appeal-late']
    };

    return res.redirect(paths.taskList);
  } catch (e) {
    next(e);
  }
}

const upload = multer().single('file-upload');

function setupHomeOfficeDetailsController(): Router {
  const router = Router();
  router.get(paths.homeOfficeDetails, getHomeOfficeDetails);
  router.post(paths.homeOfficeDetails, postHomeOfficeDetails);
  router.get(paths.homeOfficeLetterSent, getDateLetterSent);
  router.post(paths.homeOfficeLetterSent, postDateLetterSent);
  router.get(paths.homeOfficeAppealLate, getAppealLate);
  router.post(paths.homeOfficeAppealLate, upload, postAppealLate);
  return router;
}

export {
  getDateLetterSent,
  getHomeOfficeDetails,
  postDateLetterSent,
  postHomeOfficeDetails,
  getAppealLate,
  postAppealLate,
  setupHomeOfficeDetailsController
};
