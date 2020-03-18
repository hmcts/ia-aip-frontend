import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { getNextPage } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { askForMoreTimeValidation } from '../../utils/validations/fields-validations';

function getAskForMoreTimePage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('./ask-for-more-time/ask-for-more-time.njk', {
      previousPage: paths.overview
    });
  } catch (e) {
    next(e);
  }
}

function postAskForMoreTimePage(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body.cancel) {
      return res.redirect(paths.overview);
    }

    const { askForMoreTime } = req.body;
    const validation = askForMoreTimeValidation(req.body);
    if (validation) {
      return res.render('./ask-for-more-time/ask-for-more-time.njk',
        {
          errors: validation,
          errorList: Object.values(validation),
          askForMoreTime: askForMoreTime,
          previousPage: paths.overview
        }
    );
    }
    req.session.appeal.askForMoreTime = { reason: askForMoreTime };
    // TODO REDIRECT TO NEXT PAGE
    const nextPage = getNextPage(req.body, paths.overview);
    return getConditionalRedirectUrl(req, res, nextPage);

  } catch (e) {
    next(e);
  }
}

function setupAskForMoreTimeController(): Router {
  const router = Router();
  router.get(paths.askForMoreTime, getAskForMoreTimePage);
  router.post(paths.askForMoreTime, postAskForMoreTimePage);
  return router;
}

export {
  setupAskForMoreTimeController,
  getAskForMoreTimePage,
  postAskForMoreTimePage
};
