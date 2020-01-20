import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { yesOrNoRequiredValidation } from '../utils/fields-validations';

function getPreviousPageLink(questionId) {
  return questionId === '0' ? paths.start : `${paths.eligibility.questions}?id=${_.toNumber(questionId) - 1}`;
}

function getModel(nextId, answer) {
  return {
    question: i18n.eligibility[nextId].question,
    questionId: nextId,
    previousPage: getPreviousPageLink(nextId),
    answer,
    errors: undefined,
    errorList: undefined
  };
}

function eligibilityQuestionGet(req: Request, res: Response, next: NextFunction) {
  try {
    let nextId = _.get(req.query, 'id', '0');
    if (!req.session.eligibility) {
      req.session.eligibility = {};
      nextId = '0';
    }

    const answer = _.get(req.session.eligibility, nextId + '.answer', '');

    return res.render('eligibility-question.njk', getModel(nextId, answer));
  } catch (error) {
    next(error);
  }
}

function eligibilityQuestionPost(req: Request, res: Response, next: NextFunction) {
  try {
    const questionId = req.body.questionId;
    const answer = req.body.answer;

    const validation = yesOrNoRequiredValidation(req.body, i18n.eligibility[questionId].errorMessage);

    if (validation) {
      const model = getModel(questionId, answer);
      model.errors = validation;
      model.errorList = Object.values(validation);
      return res.render('eligibility-question.njk', {
        question: i18n.eligibility[questionId].question,
        questionId: questionId,
        previousPage: getPreviousPageLink(questionId),
        answer,
        errors: validation,
        errorList: Object.values(validation)
      });
    }
    if (!req.session.eligibility) {
      req.session.eligibility = {};
    }

    req.session.eligibility[questionId] = { answer };

    const isLastQuestion = _.toNumber(questionId) === i18n.eligibility.length - 1;

    const nextPage = (answer === i18n.eligibility[questionId].eligibleAnswer) ?
      isLastQuestion ? `${paths.eligibility.eligible}?id=${_.toNumber(questionId)}` : `${paths.eligibility.questions}?id=${_.toNumber(questionId) + 1}` :
      `${paths.eligibility.ineligible}?id=${_.toNumber(questionId)}`;

    return res.redirect(nextPage);
  } catch (error) {
    next(error);
  }
}

function getEligible(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.eligibility) {
      req.session.eligibility = {};
      return res.redirect(paths.eligibility.questions);
    }

    res.render('eligibility/eligible-page.njk', {
      previousPage: `${paths.eligibility.questions}?id=${req.query.id}`
    });
  } catch (e) {
    next(e);
  }
}

function getIneligible(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('eligibility/ineligible-page.njk', {
      previousPage: `${paths.eligibility.questions}?id=${req.query.id}`
    });
  } catch (e) {
    next(e);
  }
}

function setupEligibilityController(): Router {
  const router = Router();
  router.get(paths.eligibility.questions, eligibilityQuestionGet);
  router.post(paths.eligibility.questions, eligibilityQuestionPost);
  router.get(paths.eligibility.eligible, getEligible);
  router.get(paths.eligibility.ineligible, getIneligible);

  return router;
}

export {
  eligibilityQuestionGet,
  eligibilityQuestionPost,
  setupEligibilityController,
  getEligible,
  getIneligible
};
