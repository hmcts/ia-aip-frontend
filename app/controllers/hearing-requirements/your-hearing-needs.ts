import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { buildHearingRequirementsSummarySections } from './hearing-requirements-summary-sections';

function getYourHearingNeedsPage(req: Request, res: Response, next: NextFunction) {
  try {
    const hearingRequirements: HearingRequirements = req.session.appeal.hearingRequirements;
    const hasNlr: boolean = req.session.appeal?.application?.hasNonLegalRep === 'Yes';
    const hearingRequirementsSummarySections = buildHearingRequirementsSummarySections(hearingRequirements, false, hasNlr);

    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.hearingRequirements.yourHearingNeeds.title,
      previousPage: paths.common.overview,
      summarySections: hearingRequirementsSummarySections
    });
  } catch (e) {
    next(e);
  }
}

function setupYourHearingNeedsController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.yourHearingNeeds, middleware, getYourHearingNeedsPage);

  return router;
}

export {
  setupYourHearingNeedsController,
  getYourHearingNeedsPage
};
