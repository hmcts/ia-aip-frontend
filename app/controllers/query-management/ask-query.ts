import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { appealTypes } from '../../data/appeal-types';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import {
  askQueryValidation,
  statementValidation,
  typeOfAppealValidation
} from '../../utils/validations/fields-validations';

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
      return res.redirect(paths.common.sendMessagePermission);
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

function getSendMessagePermissionPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('query-management/send-message-permission.njk', {
      previousPage: paths.common.askQuery
    });
  } catch (e) {
    next(e);
  }
}

function postSendMessagePermissionPage() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = statementValidation(req.body, i18n.validationErrors.sendMessagePermissionStatement);
      if (validation) {
        return res.render('query-management/send-message-permission.njk', {
          previousPage: paths.common.askQuery,
          error: validation,
          errorList: Object.values(validation)
        });
      }

      return res.redirect(paths.common.sendMessage);
    } catch (error) {
      next(error);
    }
  };
}

function setupAskQueryController(): Router {
  const router = Router();
  router.get(paths.common.askQuery, getAskQueryPage);
  router.post(paths.common.askQuery, postAskQueryPage);
  router.get(paths.common.commonQueries, getCommonQueryPage);
  router.get(paths.common.sendMessagePermission, getSendMessagePermissionPage);
  router.post(paths.common.sendMessagePermission, postSendMessagePermissionPage());
  return router;
}

export {
  setupAskQueryController
};
