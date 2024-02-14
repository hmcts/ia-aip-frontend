import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { FEATURE_FLAGS } from '../../data/constants';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';

function getFeeSupportQuestion(appeal: Appeal) {
  let hint: string;
  let decision: string;
  hint = '';
  const question = {
    title: 'title',
    hint,
    options: [
      {
        value: '',
        text: '',
        checked: decision === ''
      },
      {
        value: '',
        text: '',
        checked: decision === ''
      }
    ],
    inline: false
  };
  return question;
}

async function getFeeSupport(req: Request, res: Response, next: NextFunction) {
  try {
    const paymentsFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.CARD_PAYMENTS, false);
    if (!paymentsFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    return res.render('templates/fee-support.njk', {
      previousPage: paths.appealStarted.taskList,
      pageTitle: '',
      formAction: paths.appealStarted.feeSupport,
      question: getFeeSupportQuestion(req.session.appeal),
      saveAndContinue: true
    });
  } catch (error) {
    next(error);
  }
}

function setupFeeSupportController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.feeSupport, middleware, getFeeSupport);
  return router;
}

export {
  getFeeSupport,
  setupFeeSupportController
};
