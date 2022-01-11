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

const formActionUrl = paths.awaitingCmaRequirements.datesToAvoidEnterDate;
const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };

function handlePostEnterADatePage(formAction: string, onSuccess: Function, req: Request, res: Response) {
  if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
    return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
  }

  const availableDates = {
    from: moment().add(2, 'week').format(dayMonthYearFormat),
    to: moment().add(12, 'week').format(dayMonthYearFormat)
  };

  let validation = isDateInRange(availableDates.from, availableDates.to, req.body,i18n.validationErrors.cmaRequirements.datesToAvoid.date.missing);

  const savedDates = req.session.appeal.cmaRequirements.datesToAvoid.dates || [];

  const find = savedDates.find((saved) =>
    saved.date.day === req.body.day &&
    saved.date.month === req.body.month &&
    saved.date.year === req.body.year
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
    return res.render('cma-requirements/dates-to-avoid/enter-a-date.njk', {
      formAction,
      errors: validation,
      errorList: Object.values(validation),
      date: { ...req.body },
      availableDates,
      previousPage: previousPage
    });
  }

  return onSuccess();
}

function getEnterADatePageWithId(req: Request, res: Response, next: NextFunction) {
  try {
    const dateId = req.params.id;
    const formActionWithId = `${formActionUrl}/${dateId}`;

    const { datesToAvoid } = req.session.appeal.cmaRequirements;
    if (datesToAvoid && datesToAvoid.dates) {
      const dateToEdit = datesToAvoid.dates[dateId].date;

      const availableDates = {
        from: moment().add(2, 'week').format(dayMonthYearFormat),
        to: moment().add(12, 'week').format(dayMonthYearFormat)
      };

      return res.render('cma-requirements/dates-to-avoid/enter-a-date.njk', {
        formAction: formActionWithId,
        date: dateToEdit,
        availableDates,
        previousPage: previousPage
      });
    }
  } catch (e) {
    next(e);
  }
}

function getEnterADatePage(req: Request, res: Response, next: NextFunction) {
  try {

    const { datesToAvoid } = req.session.appeal.cmaRequirements;
    let lastDate = null;
    if (datesToAvoid && datesToAvoid.dates && datesToAvoid.dates.length) {
      lastDate = datesToAvoid[datesToAvoid.dates.length - 1];
    }

    const availableDates = {
      from: moment().add(2, 'week').format(dayMonthYearFormat),
      to: moment().add(12, 'week').format(dayMonthYearFormat)
    };

    return res.render('cma-requirements/dates-to-avoid/enter-a-date.njk', {
      formActionUrl,
      date: lastDate,
      availableDates,
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
        const datesToAvoid: CmaDateToAvoid[] = [ ...(_.get(req.session.appeal.cmaRequirements, 'datesToAvoid.dates', [])) ];

        datesToAvoid.push({
          date: {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          } as AppealDate
        });

        req.session.appeal.cmaRequirements.datesToAvoid = {
          ...req.session.appeal.cmaRequirements.datesToAvoid,
          dates: [ ...datesToAvoid ]
        };

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.awaitingCmaRequirements.datesToAvoidReason));
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
        const { datesToAvoid } = req.session.appeal.cmaRequirements;
        if (datesToAvoid && datesToAvoid.dates) {
          datesToAvoid.dates[dateId].date = {
            day: req.body.day,
            month: req.body.month,
            year: req.body.year
          };
        }

        await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
        return getConditionalRedirectUrl(req, res, getNextPage(req.body, `${paths.awaitingCmaRequirements.datesToAvoidReason}/${dateId}`));
      };

      return handlePostEnterADatePage(formActionWithId, onSuccess, req, res);
    } catch (e) {
      next(e);
    }
  };
}

function setupDatesToAvoidEnterADateController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidEnterDate, middleware, getEnterADatePage);
  router.get(paths.awaitingCmaRequirements.datesToAvoidEnterDateWithId, middleware, getEnterADatePageWithId);
  router.post(paths.awaitingCmaRequirements.datesToAvoidEnterDate, middleware, postEnterADatePage(updateAppealService));
  router.post(paths.awaitingCmaRequirements.datesToAvoidEnterDateWithId, middleware, postEnterADatePageWithId(updateAppealService));

  return router;
}

export {
  setupDatesToAvoidEnterADateController,
  getEnterADatePage,
  getEnterADatePageWithId,
  postEnterADatePage,
  postEnterADatePageWithId
};
