import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';

function getHearingApplicationType(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        askToChangeSomethingAboutYourHearing: createStructuredError('askToChangeSomethingAboutYourHearing', i18n.validationErrors.makeApplication.askToChangeSomethingAboutYourHearing)
      };
    }

    const decision = req.session.appeal.hearingApplicationType;

    const question = {
      title: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.title,
      heading: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.heading,
      name: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.name,
      titleIsheading: true,
      options: [
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingSooner.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingSooner.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingSooner.value
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingLater.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingLater.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.hearingLater.value
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.changeHearingLocation.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.changeHearingLocation.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.changeHearingLocation.value
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.askForSomething.value,
          text: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.askForSomething.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.options.askForSomething.value
        }
      ],
      inline: false
    };

    return res.render('make-application/application-type-page.njk', {
      previousPage: paths.common.overview,
      pageTitle: i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.title,
      formAction: paths.makeApplication.askChangeHearing,
      question,
      ...validationErrors && { errorList: Object.values(validationErrors) },
      saveAndContinue: false
    });
  } catch (error) {
    next(error);
  }
}

function postHearingApplicationType(req: Request, res: Response, next: NextFunction) {
  try {
    const decision = req.body[i18n.pages.makeApplication.hearingRequests.askToChangeSomethingAboutYourHearing.question.name];

    if (decision) {
      req.session.appeal = {
        ...req.session.appeal,
        hearingApplicationType: decision
      };
      res.redirect(paths.makeApplication[decision]);
    } else {
      res.redirect(`${paths.makeApplication.askChangeHearing}?error=askToChangeSomethingAboutYourHearing`);
    }
  } catch (error) {
    next(error);
  }
}

function setupHearingApplicationTypeController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.makeApplication.askChangeHearing, middleware, getHearingApplicationType);
  router.post(paths.makeApplication.askChangeHearing, middleware, postHearingApplicationType);
  return router;
}

export {
  getHearingApplicationType,
  postHearingApplicationType,
  setupHearingApplicationTypeController
};
