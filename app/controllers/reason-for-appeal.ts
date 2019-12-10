
import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
// import {Events} from '../service/ccd-service';
import UpdateAppealService from '../service/update-appeal-service';
import { homeOfficeDecisionValidation } from '../utils/fields-validations';

function getReasonForAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons/wrong-decision.njk');
  } catch (e) {
    next(e);
  }
}

function postReasonForAppeal(updateAppealService: UpdateAppealService) {
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = homeOfficeDecisionValidation(req.body);
      if (validation != null) {
        return res.render('case-building/reasons/wrong-decision.njk', {
          errorList: Object.values(validation),
          error: validation

        });
      }
      req.session.appeal.caseBuilding = {
        decision: req.body.moreDetail
      };
      // TODO Save to CCD.
      return res.render('case-building/reasons/wrong-decision.njk');
    } catch (e) {
      next(e);
    }
  };
}

function setUpReasonsForAppealController(deps?: any): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.decision, getReasonForAppeal);
  router.post(paths.reasonsForAppeal.decision, postReasonForAppeal(deps.updateAppealService));

  return router;
}

export {
    setUpReasonsForAppealController,
    getReasonForAppeal,
    postReasonForAppeal

};
