import { Request, Response, Router } from 'express';
import { paths } from '../paths';

function getApplicationOverview(req: Request, res: Response) {
  res.render('application-overview.njk');
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
