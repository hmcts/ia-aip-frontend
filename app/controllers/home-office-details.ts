import { Router } from 'express';
import { paths } from '../paths';
import { homeOfficeNumberValidation } from '../utils/fields-validations';

function getHomeOfficeDetails(req, res, next) {
  try {
    res.render('appeal-application/home-office-details.njk', { application: req.session.appealApplication });
  } catch (e) {
    next(e);
  }
}

function postHomeOfficeDetails(req, res, next) {
  try {
    let error = null;
    const homeOfficeDetails = req.body['homeOfficeRefNumber'];
    const validation = homeOfficeNumberValidation(homeOfficeDetails);
    if (validation) error = validation;
    else req.session.appealApplication['homeOfficeReference'] = homeOfficeDetails;

    res.render('appeal-application/home-office-details.njk', { error, application: req.session.appealApplication });
  } catch (e) {
    next(e);
  }
}

function setupHomeOfficeDetailsController(): Router {
  const router = Router();
  router.get(paths.homeOfficeDetails, getHomeOfficeDetails);
  router.post(paths.homeOfficeDetails, postHomeOfficeDetails);
  return router;
}

export {
  getHomeOfficeDetails,
  postHomeOfficeDetails,
  setupHomeOfficeDetailsController
};
