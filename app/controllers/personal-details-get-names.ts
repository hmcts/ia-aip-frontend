import { NextFunction, Response, Router } from 'express';
import { Request } from '../domain/request';
import { paths } from '../paths';
import Logger from '../utils/logger';
import { EnterDetailsValidation } from '../utils/personal-details-schema';

const logLabel: string = __filename;

function getNamePage(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    res.render('get-names-page.njk');
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function postNamePage(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    const validation = EnterDetailsValidation(req.body);
    let errors = null;
    if (validation) {
      errors = validation;
      res.render('get-names-page.njk', { errors: { errorList: errors } });
    } else {
      res.render('get-names-page.njk', {  familyName: req.body.familyName, givenNames: req.body.givenNames });
    }
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }

}

/* istanbul ignore next */
function setupPersonalDetailsController(deps?: any): Router {
  const router = Router();
  router.get(paths.enterName, getNamePage);
  router.post(paths.enterName, postNamePage);
  return router;
}

export {
    setupPersonalDetailsController,
    getNamePage,
    postNamePage
};
