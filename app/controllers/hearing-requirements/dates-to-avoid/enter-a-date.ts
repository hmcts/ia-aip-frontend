import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { dayMonthYearFormat } from '../../../utils/date-utils';
import { getNextPage, shouldValidateWhenSaveForLater } from '../../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { isDateInRange } from '../../../utils/validations/fields-validations';
import { getHearingStartDate } from '../common';

const formActionUrl = paths.submitHearingRequirements.hearingDatesToAvoidEnterDate;
const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

function handlePostEnterADatePage(formAction: string, onSuccess: Function, req: Request, res: Response) {
  if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
    return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
  }

  const startDate = getHearingStartDate(req.session.appeal.directions);
  const availableHearingDates = {
    from: moment(startDate).format(dayMonthYearFormat),
    to: moment(startDate).add(6, 'week').format(dayMonthYearFormat)
  };

  let validation = isDateInRange(availableHearingDates.from, availableHearingDates.to, req.body,i18n.validationErrors.hearingRequirements.datesToAvoid.date.missing);

  const savedDates = req.session.appeal.hearingRequirements.datesToAvoid.dates || [];

  const find = savedDates.find((saved) =>
    saved.date.day === req.body.day &&
    saved.date.month === req.body.month &&
    saved.date.year === req.body.year &&
    saved.reason
  );

  if (find) {
    validation = {
      date: {
        href: '#date',
        key: 'date',
        text: 'You have already entered this date'
      }
    };
  }

  if (validation != null) {
    return res.render('hearing-requirements/dates-to-avoid/enter-a-date.njk', {
      formAction,
      errors: validation,
      errorList: Object.values(validation),
      date: { ...req.body },
      availableHearingDates,
      previousPage: previousPage
    });
  }

  return onSuccess();
}

function getEnterADatePageWithId(req: Request, res: Response, next: NextFunction) {
  try {
    const dateId = req.params.id;
    const formActionWithId = `${formActionUrl}/${dateId}`;

    const { datesToAvoid } = req.session.appeal.hearingRequirements;
    if (datesToAvoid && datesToAvoid.dates) {
      const dateToEdit = datesToAvoid.dates[dateId].date;
      const startDate = getHearingStartDate(req.session.appeal.directions);
      const availableHearingDates = {
        from: moment(startDate).format(dayMonthYearFormat),
        to: moment(startDate).add(6, 'week').format(dayMonthYearFormat)
      };

      return res.render('hearing-requirements/dates-to-avoid/enter-a-date.njk', {
        formAction: formActionWithId,
        date: dateToEdit,
        availableHearingDates,
        previousPage: previousPage
      });
    }
  } catch (e) {
    next(e);
  }
}

function getEnterADatePage(req: Request, res: Response, next: NextFunction) {
  try {

    const { datesToAvoid } = req.session.appeal.hearingRequirements;
    let lastDate = null;
    if (datesToAvoid && datesToAvoid.dates && datesToAvoid.dates.length) {
      lastDate = datesToAvoid.dates[datesToAvoid.dates.length - 1];
    }
    const startDate = getHearingStartDate(req.session.appeal.directions);
    const availableHearingDates = {
      from: moment(startDate).format(dayMonthYearFormat),
      to: moment(startDate).add(6, 'week').format(dayMonthYearFormat)
    };

    return res.render('hearing-requirements/dates-to-avoid/enter-a-date.njk', {
      formActionUrl,
      date: lastDate,
      availableHearingDates,
      previousPage: previousPage
    });
  } catch (e) {
    next(e);
  }
}

function postEnterADatePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      const onSuccess = async () => {
        const datesToAvoid: CmaDateToAvoid[] = [ ...(_.get(req.session.appeal.hearingRequirements, 'datesToAvoid.dates', [])) ];

        const find = datesToAvoid.find((saved) =>
                saved.date.day === req.body.day &&
                saved.date.month === req.body.month &&
                saved.date.year === req.body.year
        );

        if (!find) {
          datesToAvoid.push({
            date: {
              day: req.body.day,
              month: req.body.month,
              year: req.body.year
            } as AppealDate
          });
        }

        req.session.appeal.hearingRequirements.datesToAvoid = {
          ...req.session.appeal.hearingRequirements.datesToAvoid,
          dates: [ ...datesToAvoid ]
        };

        await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
        return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.submitHearingRequirements.hearingDateToAvoidReasons));
      };

      return handlePostEnterADatePage(formActionUrl, onSuccess, req, res);
    } catch (e) {
      next(e);
    }
  };
}

function postEnterADatePageWithId(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const dateId = req.params.id;
      const formActionWithId = `${formActionUrl}/${dateId}`;

      const onSuccess = async () => {
        const { datesToAvoid } = req.session.appeal.hearingRequirements;
        if (datesToAvoid && datesToAvoid.dates) {
          datesToAvoid.dates[dateId].date = {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          };
        }

        await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
        return getConditionalRedirectUrl(req, res, getNextPage(req.body, `${paths.submitHearingRequirements.hearingDateToAvoidReasons}/${dateId}`));
      };

      return handlePostEnterADatePage(formActionWithId, onSuccess, req, res);
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingDatesToAvoidEnterADateController (middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate, middleware, getEnterADatePage);
  router.get(paths.submitHearingRequirements.hearingDatesToAvoidEnterDateWithId, middleware, getEnterADatePageWithId);
  router.post(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate, middleware, postEnterADatePage(updateAppealService));
  router.post(paths.submitHearingRequirements.hearingDatesToAvoidEnterDateWithId, middleware, postEnterADatePageWithId(updateAppealService));

  return router;
}

export {
  setupHearingDatesToAvoidEnterADateController,
  getEnterADatePage,
  getEnterADatePageWithId,
  postEnterADatePage,
  postEnterADatePageWithId
};
