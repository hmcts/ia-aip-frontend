import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { handleHearingRequirementsSaveForLater } from './common';
import { buildHearingRequirementsSummarySections } from './hearing-requirements-summary-sections';

function getCheckAndSendPage(req: Request, res: Response, next: NextFunction) {
  try {
    const hearingRequirements: HearingRequirements = req.session.appeal.hearingRequirements;
    const hearingRequirementsSummarySections = buildHearingRequirementsSummarySections(hearingRequirements,true);

    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.cmaRequirementsCYA.title,
      formAction: paths.submitHearingRequirements.checkAndSend,
      previousPage: paths.submitHearingRequirements.taskList,
      summarySections: hearingRequirementsSummarySections
    });
  } catch (e) {
    next(e);
  }
}

function postCheckAndSendPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body['saveForLater']) {
        await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
        return handleHearingRequirementsSaveForLater(req,res);
      }
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.SUBMIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      req.app.locals.logger.trace(`Hearing requirements submitted for AIP appeal with ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation Hearing Requirements');
      res.redirect(paths.submitHearingRequirements.confirmation);
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingRequirementsCYAController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.checkAndSend, middleware, getCheckAndSendPage);
  router.post(paths.submitHearingRequirements.checkAndSend, middleware, postCheckAndSendPage(updateAppealService));

  return router;
}

export {
  setupHearingRequirementsCYAController,
  getCheckAndSendPage,
  postCheckAndSendPage
};
