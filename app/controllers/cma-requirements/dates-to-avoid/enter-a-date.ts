import { NextFunction, Request, Response, Router } from 'express';
import moment from 'moment';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { dayMonthYearFormat } from '../../../utils/date-utils';
import { getNextPage, shouldValidateWhenSaveForLater } from '../../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../../utils/url-utils';
import { isDateInRange } from '../../../utils/validations/fields-validations';

function getEnterADatePage(req: Request, res: Response, next: NextFunction) {
  try {

    const { datesToAvoid } = req.session.appeal.cmaRequirements;
    let lastDate = null;
    if (datesToAvoid && datesToAvoid.length) {
      lastDate = datesToAvoid[datesToAvoid.length - 1];
    }

    const availableDates = {
      from: moment().add(2, 'week').format(dayMonthYearFormat),
      to: moment().add(12, 'week').format(dayMonthYearFormat)
    };

    return res.render('cma-requirements/dates-to-avoid/enter-a-date.njk', {
      date: lastDate,
      availableDates,
      previousPage: paths.awaitingCmaRequirements.datesToAvoidQuestion
    });
  } catch (e) {
    next(e);
  }
}

function postEnterADatePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }

      const availableDates = {
        from: moment().add(2, 'week').format(dayMonthYearFormat),
        to: moment().add(12, 'week').format(dayMonthYearFormat)
      };

      const validation = isDateInRange(availableDates.from, availableDates.to, req.body);

      if (validation != null) {
        return res.render('cma-requirements/dates-to-avoid/enter-a-date.njk', {
          errors: validation,
          errorList: Object.values(validation),
          date: { ...req.body },
          availableDates,
          previousPage: paths.awaitingCmaRequirements.datesToAvoidQuestion
        });
      }

      const datesToAvoid: DateToAvoid[] = [ ...(req.session.appeal.cmaRequirements.datesToAvoid || []) ];

      datesToAvoid.push({
        date: {
          day: req.body.day,
          month: req.body.month,
          year: req.body.year
        }
      });

      req.session.appeal.cmaRequirements.datesToAvoid = [ ...datesToAvoid ];

      await updateAppealService.submitEvent(Events.EDIT_CMA_REQUIREMENTS, req);
      return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.awaitingCmaRequirements.datesToAvoidReason));
    } catch (e) {
      next(e);
    }
  };
}

function setupDatesToAvoidEnterADateController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.datesToAvoidEnterDate, middleware, getEnterADatePage);
  router.post(paths.awaitingCmaRequirements.datesToAvoidEnterDate, middleware, postEnterADatePage(updateAppealService));

  return router;
}

export {
  setupDatesToAvoidEnterADateController,
  getEnterADatePage,
  postEnterADatePage
};
