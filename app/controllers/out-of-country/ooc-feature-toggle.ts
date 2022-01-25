import { Router } from 'express';

function setupOutOfCountryFeatureToggleController(middleware: Middleware[]): Router {
  const router = Router();
  // Add the paths here for hearing bundles feature e.g., router.get(path,middleware,outOfCountryFeatureMiddleware,getView);
  return router;
}

export {
  setupOutOfCountryFeatureToggleController
};
