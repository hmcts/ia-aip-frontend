import { Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../paths';

function health(req: Request<Params>, res: Response) {
  res.json({ status: 'UP' });
}

function liveness(req: Request<Params>, res: Response) {
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
