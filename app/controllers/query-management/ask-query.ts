import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { appealTypes } from '../../data/appeal-types';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import { askQueryValidation, typeOfAppealValidation } from '../../utils/validations/fields-validations';

function getAskQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('query-management/ask-query.njk', {
      previousPage: paths.common.overview,
      commonQueries: i18n.pages.askQuery.commonQueries
    });
  } catch (e) {
    next(e);
  }
}

function postAskQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = askQueryValidation(req.body);
    if (validation) {
      return res.render('query-management/ask-query.njk', {
        previousPage: paths.common.overview,
        commonQueries: i18n.pages.askQuery.commonQueries,
        errors: validation,
        errorList: Object.values(validation)
      });
    }
    const chosenCommonQueryValue = i18n.pages.askQuery.commonQueries
      .find(query => query.value === req.body['queries']);
    if (chosenCommonQueryValue) {
      return res.redirect(`${paths.common.commonQueries}?queryValue=${req.body['queries']}`);
    } else {
      return res.redirect(paths.common.sendMessage);
    }
  } catch (e) {
    next(e);
  }
}

function getCommonQueryPage(req: Request, res: Response, next: NextFunction) {
  try {
    const queryValue = req?.query?.['queryValue'];
    const queryObj = i18n.pages.askQuery.commonQueries
      .find(query => query.value === queryValue);
    if (!queryObj) {
      return res.redirect(paths.common.askQuery);
    }
    return res.render('query-management/common-query.njk', {

      previousPage: paths.common.askQuery,
      query: queryObj
    });
  } catch (e) {
    next(e);
  }
}

function setupAskQueryController(): Router {
  const router = Router();
  router.get(paths.common.askQuery, getAskQueryPage);
  router.post(paths.common.askQuery, postAskQueryPage);
  router.get(paths.common.commonQueries, getCommonQueryPage);
  return router;
}

export {
  setupAskQueryController,
  getAskQueryPage
};
