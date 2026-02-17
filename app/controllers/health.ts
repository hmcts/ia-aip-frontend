import { Request, Response, Router } from 'express';
import { paths } from '../paths';

function health(req: Request, res: Response) {
  res.json({ status: 'UP' });
}

function liveness(req: Request, res: Response) {
  res.json({});
}

/* istanbul ignore next */
function setupHealthController(): Router {
  const router = Router();
  router.get(paths.common.health, health);
  router.get(paths.common.liveness, liveness);
  router.get(paths.common.healthLiveness, liveness);
  router.get(paths.common.healthReadiness, health);
  return router;
}

export {
  setupHealthController,
  health,
  liveness
};
