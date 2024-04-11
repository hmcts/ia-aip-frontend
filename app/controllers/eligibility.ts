import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import LaunchDarklyService from '../service/launchDarkly-service';
import { yesOrNoRequiredValidation } from '../utils/validations/fields-validations';

function getPreviousPageLink(questionId) {
  return questionId === '0' ? paths.common.start : `${paths.common.questions}?id=${_.toNumber(questionId) - 1}`;
}

async function getModel(nextId, answer) {

  const i18nEligibility = await getI18nEligibility();

  return {
    question: i18nEligibility[nextId].question,
    description: i18nEligibility[nextId].description,
    modal: i18nEligibility[nextId].modal,
    questionId: nextId,
    previousPage: getPreviousPageLink(nextId),
    answer,
    errors: undefined,
    errorList: undefined
  };
}

async function eligibilityQuestionGet(req: Request, res: Response, next: NextFunction) {
  try {
    let nextId = _.get(req.query, 'id', '0');
    if (!req.session.eligibility) {
      req.session.eligibility = {};
      nextId = '0';
    }

    const answer = _.get(req.session.eligibility, nextId + '.answer', '');

    return res.render('eligibility/eligibility-question.njk', await getModel(nextId, answer));
  } catch (error) {
    next(error);
  }
}

async function eligibilityQuestionPost(req: Request, res: Response, next: NextFunction) {
  try {
    const questionId = req.body.questionId;
    if (questionId != undefined && parseInt(questionId.toString()) > 10000000) {
      throw RangeError('Question ID is out of range')
    }
    const answer = req.body.answer;
    const i18nEligibility = await getI18nEligibility();
    const validation = yesOrNoRequiredValidation(req.body, i18nEligibility[questionId].errorMessage);

    if (validation) {
      const model = await getModel(questionId, answer);
      model.errors = validation;
      model.errorList = Object.values(validation);
      return res.render('eligibility/eligibility-question.njk', {
        question: i18nEligibility[questionId].question,
        description: i18nEligibility[questionId].description,
        modal: i18nEligibility[questionId].modal,
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
    const isLastQuestion = nextQuestionId === i18nEligibility.length;

    const nextPage = await isEligibilityQuestion(questionId, answer, i18nEligibility) ?
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
    if (req.query.id != undefined && parseInt(req.query.id.toString()) > 10000000) {
      throw RangeError('ID is out of range')
    }
    res.render('eligibility/eligible-page.njk', {
      previousPage: `${paths.common.questions}?id=${req.query.id}`
    });
  } catch (e) {
    next(e);
  }
}

async function getIneligible(req: Request, res: Response, next: NextFunction) {
  try {
    const i18nIneligible = await getI18nIneligible();
    const questionId: string = req.query.id as string;
    if (req.query.id != undefined && parseInt(req.query.id.toString()) > 10000000) {
      throw RangeError('ID is out of range')
    }
    res.render('eligibility/ineligible-page.njk', {
      ...i18nIneligible[questionId],
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

async function isEligibilityQuestion(questionId: string, answer: string, i18nEligibility: any) {
  return _.isString(i18nEligibility[questionId].eligibleAnswer) ?
    answer === i18nEligibility[questionId].eligibleAnswer :
    i18nEligibility[questionId].eligibleAnswer.indexOf(answer) > -1;
}

async function outOfCountryFeature() {
  return LaunchDarklyService.getInstance().getVariation(null, 'aip-ooc-feature', false);
}

async function getI18nEligibility() {
  const oocFlag = await outOfCountryFeature();

  if (oocFlag) {
    return i18n.eligibilityOOCFlag;
  } else {
    return i18n.eligibility;
  }
}

async function getI18nIneligible() {
  const oocFlag = await outOfCountryFeature();

  if (oocFlag) {
    return i18n.ineligibleOOCFlag;
  } else {
    return i18n.ineligible;
  }
}

export {
  eligibilityQuestionGet,
  eligibilityQuestionPost,
  setupEligibilityController,
  getEligible,
  getIneligible
};
