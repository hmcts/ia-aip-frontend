import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { getRedirectPage } from '../../utils/utils';

async function getFeeSupport(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('appeal-application/fee-support/fee-support.njk', {
      previousPage: paths.appealStarted.taskList,
      pageTitle: '',
      formAction: paths.appealStarted.feeSupport,
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}
function postFeeSupport(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultRedirect = paths.appealStarted.taskList;
      let redirectPage = getRedirectPage(false, paths.appealStarted.checkAndSend, req.body.saveForLater, defaultRedirect);
      req.session.appeal.application.feeSupportPersisted = true;

      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupFeeSupportController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.feeSupport, middleware, getFeeSupport);
  router.post(paths.appealStarted.feeSupport, middleware, postFeeSupport(updateAppealService));
  return router;
}

export {
  setupFeeSupportController,
  getFeeSupport,
  postFeeSupport
};
