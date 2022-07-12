import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../../locale/en.json';
import { applicationTypes } from '../../../data/application-types';
import { paths } from '../../../paths';
import { createStructuredError } from '../../../utils/validations/fields-validations';

function getHearingApplicationType(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        askChangeHearing: createStructuredError('askChangeHearing', i18n.validationErrors.makeApplication.askChangeHearing)
      };
    }

    let decision;
    if (req.session.appeal.makeAnApplicationTypes) {
      decision = req.session.appeal.makeAnApplicationTypes.value.code;
    }

    const question = {
      title: i18n.pages.makeApplication.hearingRequests.askChangeHearing.title,
      heading: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.heading,
      name: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.name,
      titleIsheading: true,
      options: [
        {
          value: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askHearingSooner.value,
          text: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askHearingSooner.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askHearingSooner.value
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askChangeDate.value,
          text: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askChangeDate.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askChangeDate.value
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askChangeLocation.value,
          text: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askChangeLocation.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askChangeLocation.value
        },
        {
          value: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askUpdateHearingRequirements.value,
          text: i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askUpdateHearingRequirements.text,
          checked: decision === i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.options.askUpdateHearingRequirements.value
        }
      ],
      inline: false
    };

    return res.render('make-application/radio-button-question-page.njk', {
      previousPage: paths.common.overview,
      pageTitle: i18n.pages.makeApplication.hearingRequests.askChangeHearing.title,
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
    const decision = req.body[i18n.pages.makeApplication.hearingRequests.askChangeHearing.question.name];

    if (decision) {
      const makeAnApplicationTypes = {
        value: {
          code: decision,
          label: applicationTypes[decision]
        }
      };
      req.session.appeal = {
        ...req.session.appeal,
        makeAnApplicationTypes
      };
      res.redirect(paths.makeApplication[decision]);
    } else {
      res.redirect(`${paths.makeApplication.askChangeHearing}?error=askChangeHearing`);
    }
  } catch (error) {
    next(error);
  }
}

export {
  getHearingApplicationType,
  postHearingApplicationType
};
