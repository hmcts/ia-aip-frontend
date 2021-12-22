import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { buildHearingRequirementsSummarySections } from './hearing-requirements-summary-sections';

function getYourHearingNeedsPage(req: Request, res: Response, next: NextFunction) {
  try {
    const hearingRequirements: HearingRequirements = req.session.appeal.hearingRequirements;
    const hearingRequirementsSummarySections = buildHearingRequirementsSummarySections(hearingRequirements);

    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.hearingRequirements.yourHearingNeeds.title,
      previousPage: paths.common.overview,
      summarySections: hearingRequirementsSummarySections
    });
  } catch (e) {
    next(e);
  }
}

function postYourHearingNeedsPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: check if we need to submit these changes to any CCD event
      res.redirect(paths.common.overview);
    } catch (e) {
      next(e);
    }
  };
}

function setupYourHearingNeedsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.yourHearingNeeds, middleware, getYourHearingNeedsPage);
  router.post(paths.submitHearingRequirements.yourHearingNeeds, middleware, postYourHearingNeedsPage(updateAppealService));

  return router;
}

export {
  setupYourHearingNeedsController,
  getYourHearingNeedsPage,
  postYourHearingNeedsPage
};
