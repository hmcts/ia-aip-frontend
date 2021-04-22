import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { yesOrNoRequiredValidation } from '../utils/validations/fields-validations';

function getPreviousPageLink(questionId) {
  return questionId === '0' ? paths.common.start : `${paths.common.questions}?id=${_.toNumber(questionId) - 1}`;
}

function getModel(nextId, answer) {
  return {
    question: i18n.eligibility[nextId].question,
    description: i18n.eligibility[nextId].description,
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

    return res.render('eligibility/eligibility-question.njk', getModel(nextId, answer));
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
      return res.render('eligibility/eligibility-question.njk', {
        question: i18n.eligibility[questionId].question,
        description: i18n.eligibility[questionId].description,
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

    let nextQuestionId = _.toNumber(questionId) + 1;
    const isLastQuestion = nextQuestionId === i18n.eligibility.length;

    const nextPage = isEligibilityQuestion(questionId, answer) ?
    isLastQuestion ? `${paths.common.eligible}?id=${_.toNumber(questionId)}` : `${paths.common.questions}?id=${nextQuestionId}` :
    `${paths.common.ineligible}?id=${_.toNumber(questionId)}`;

    return res.redirect(nextPage);
  } catch (error) {
    next(error);
  }
}
function getEligible(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.eligibility) {
      req.session.eligibility = {};
      return res.redirect(paths.common.questions);
    }

    res.render('eligibility/eligible-page.njk', {
      previousPage: `${paths.common.questions}?id=${req.query.id}`
    });
  } catch (e) {
    next(e);
  }
}

function getIneligible(req: Request, res: Response, next: NextFunction) {
  try {
    const questionId: string = req.query.id as string;
    res.render('eligibility/ineligible-page.njk', {
      title: i18n.ineligible[questionId].title,
      description: i18n.ineligible[questionId].description,
      optionsList: i18n.ineligible[questionId].optionsList,
      previousPage: `${paths.common.questions}?id=${req.query.id}`
    });
  } catch (e) {
    next(e);
  }
}

function setupEligibilityController(): Router {
  const router = Router();
  router.get(paths.common.questions, eligibilityQuestionGet);
  router.post(paths.common.questions, eligibilityQuestionPost);
  router.get(paths.common.eligible, getEligible);
  router.get(paths.common.ineligible, getIneligible);

  return router;
}

function isEligibilityQuestion(questionId: string, answer: string) {
  return _.isString(i18n.eligibility[questionId].eligibleAnswer) ?
      answer === i18n.eligibility[questionId].eligibleAnswer :
      i18n.eligibility[questionId].eligibleAnswer.indexOf(answer) > -1;
}

export {
  eligibilityQuestionGet,
  eligibilityQuestionPost,
  setupEligibilityController,
  getEligible,
  getIneligible
};
