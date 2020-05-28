import { NextFunction, Request, Response } from 'express';
import { paths } from '../../paths';
import { yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

function handleCmaRequirementsYesNo(onValidationError, onValidationErrorMessage: string, onSuccess, req: Request, next: NextFunction) {
  try {
    const { answer } = req.body;
    const validations = yesOrNoRequiredValidation(req.body, onValidationErrorMessage);
    if (validations !== null) {
      return onValidationError(validations);
    }
    return answer === 'yes' ? onSuccess(true) : onSuccess(false);
  } catch (e) {
    next(e);
  }
}

export function postCmaRequirementsYesNoHandler(pageContent, onValidationErrorMessage: string, req: Request, res: Response, next: NextFunction) {
  const onValidationError = (validations) => res.render('templates/radio-question-page.njk', {
    previousPage: pageContent.previousPage,
    pageTitle: pageContent.pageTitle,
    formAction: pageContent.formAction,
    question: pageContent.question,
    errorList: Object.values(validations),
    error: validations
  });

  const onSuccess = (answer: boolean) => {
    if (answer) {
      return res.redirect(paths.awaitingCmaRequirements.datesToAvoidEnterDate);
    } else {
      // Mark section as completed
      return res.redirect(paths.awaitingCmaRequirements.taskList);
    }
  };

  return handleCmaRequirementsYesNo(
    onValidationError,
    onValidationErrorMessage,
    onSuccess,
    req,
    next
  );
}
