import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { decodeJWTToken, isJWTExpired } from '../utils/jwt-utils';

export function getNameFromIDAM(req: Request) {
  let name: string = '';
  if (!isJWTExpired(req.cookies['__auth-token'])) {
    const data = decodeJWTToken(req.cookies['__auth-token']);
    name = `${data.forename} ${data.surname}`;
    return name;
  }
}

function getApplicationOverview(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('application-overview.njk', {
      name: getNameFromIDAM(req)
    });
  } catch (e) {
    next(e);
  }
}

function setupApplicationOverviewController(): Router {
  const router = Router();
  router.get(paths.overview, getApplicationOverview);

  return router;
}

export {
  setupApplicationOverviewController,
  getApplicationOverview
};
