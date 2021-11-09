import { NextFunction, Request, Response } from 'express';
import { paths } from '../../paths';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

function handleHearingRequirementsYesNo (onValidationError, onValidationErrorMessage: string, onSuccess, req: Request, res: Response, next: NextFunction) {
  try {
    if (!shouldValidateWhenSaveForLater(req.body, 'reason')) {
      return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
    }
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

export function postHearingRequirementsYesNoHandler (pageContent, onValidationErrorMessage: string, onSuccess: Function, req: Request, res: Response, next: NextFunction) {

  const onValidationError = (validations) => res.render('templates/radio-question-page.njk', {
    ...pageContent,
    errorList: Object.values(validations),
    error: validations
  });

  return handleHearingRequirementsYesNo(
        onValidationError,
        onValidationErrorMessage,
        onSuccess,
        req,
        res,
        next
    );
}
