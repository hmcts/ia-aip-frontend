import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';
import { paths } from '../../paths';
import { textAreaValidation, yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

function handleCmaRequirementsYesNo(onValidationError, onValidationErrorMessage: string, onSuccess, req: Request, next: NextFunction) {
  try {
    const { answer } = req.body;
    const validations = yesOrNoRequiredValidation(req.body, onValidationErrorMessage);
    if (validations) {
      return onValidationError(validations);
    }
    return answer === 'yes' ? onSuccess(true) : onSuccess(false);
  } catch (e) {
    next(e);
  }
}

export function postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage: string, onSuccess: Function, req: Request, res: Response, next: NextFunction) {

  const onValidationError = (validations) => res.render('templates/radio-question-page.njk', {
    ...pageContent,
    errorList: Object.values(validations),
    error: validations
  });

  return handleCmaRequirementsYesNo(
    onValidationError,
    onValidationErrorMessage,
    onSuccess,
    req,
    next
  );
}

function handleCmaRequirementsReason(onValidationError, onValidationErrorMessage: string, onSuccess, req: Request, next: NextFunction) {
  try {
    const { reason } = req.body;
    const validations = textAreaValidation(reason, 'reason', onValidationErrorMessage);
    if (validations) {
      return onValidationError(validations);
    }
    return onSuccess();
  } catch (e) {
    next(e);
  }
}

export function getCmaRequirementsReasonHandler(pageContent, onValidationErrorMessage: string, onSuccess: Function, req: Request, res: Response, next: NextFunction) {
  const onValidationError = (validations) => res.render('templates/textarea-question-page.njk', {
    ...pageContent,
    errorList: Object.values(validations),
    error: validations
  });

  return handleCmaRequirementsReason(
    onValidationError,
    onValidationErrorMessage,
    onSuccess,
    req,
    next
  );
}

export function handleCmaRequirementsSaveForLater(req: Request, res: Response) {
  if (_.has(req.session, 'appeal.cmaRequirements.isEdit')
    && req.session.appeal.cmaRequirements.isEdit === true) {
    req.session.appeal.cmaRequirements.isEdit = false;
  }
  return res.redirect(paths.common.overview + '?saved');
}
