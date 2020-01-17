import { Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { yesOrNoRequiredValidation } from '../utils/fields-validations';

function getPreviousPageLink(questionId) {
  return questionId === '0' ? paths.start : `${paths.eligibility}?id=${_.toNumber(questionId) - 1}`;
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

function eligibilityQuestionGet(req: Request, res: Response) {
  let nextId = _.get(req.query, 'id', '0');
  if (!req.session.eligibility) {
    req.session.eligibility = {};
    nextId = '0';
  }

  const answer = _.get(req.session.eligibility, nextId + '.answer', '');

  return res.render('eligibility-question.njk', getModel(nextId, answer));
}

function eligibilityQuestionPost(req: Request, res: Response) {
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
    isLastQuestion ? paths.login : `${paths.eligibility}?id=${_.toNumber(questionId) + 1}` :
    paths.ineligibile;

  return res.redirect(nextPage);
}

function setupEligibilityController(): Router {
  const router = Router();
  router.get(paths.eligibility, eligibilityQuestionGet);
  router.post(paths.eligibility, eligibilityQuestionPost);
  router.get(paths.ineligibile, (req: Request, res: Response) => {
    return res.render('eligibility-question.njk', {
      question: 'ineligible',
      questionId: 0,
      previousPage: paths.start
    });
  });
  return router;
}

export {
  eligibilityQuestionGet,
  eligibilityQuestionPost,
  setupEligibilityController
};
