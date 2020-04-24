import { NextFunction, Request, Response } from 'express';
import { paths } from '../paths';

const isJourneyAllowedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const currentPath: string = req.path;
  const appealStatusPathsCopy = { ...paths[req.session.appeal.appealStatus] } || {};
  const appealStatusPaths = Object.values(appealStatusPathsCopy).map((path: string) => {
    if (Object.keys(req.params).length === 0) return path;
    const matches = path.match(/\/:([^\/]+)\/?$/);
    if (!matches) return path;
    if (matches[1] && req.params[matches[1]]) {
      return path.replace(new RegExp(`:${matches[1]}`), `${req.params[matches[1]]}`);
    }
  });
  const allowedPaths = [
    ...appealStatusPaths,
    ...Object.values(paths.common)
  ];
  const allowed: boolean = allowedPaths.includes(currentPath) ||
    currentPath.startsWith(paths.common.detailsViewers.document);
  if (allowed) { return next(); }
  return res.redirect(paths.common.forbidden);
};

const isTimeExtensionsInProgress = (req: Request, res: Response, next: NextFunction) => {
  const currentPath: string = req.path;
  const hasInFlightAskForMoreTime = req.session.appeal.previousAskForMoreTime.filter(askForMoreTime => {
    return askForMoreTime.value.status === 'submitted' &&
      askForMoreTime.value.state === req.session.appeal.appealStatus;
  }).length > 0;

  const isJourneyAllowed = !Object.values(paths.common.askForMoreTime).includes(currentPath) || !hasInFlightAskForMoreTime;

  if (isJourneyAllowed) {
    return next();
  }
  return res.redirect(paths.common.forbidden);
};

export {
  isJourneyAllowedMiddleware,
  isTimeExtensionsInProgress
};
