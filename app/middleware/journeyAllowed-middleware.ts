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
  const allowed: boolean = allowedPaths.includes(currentPath);
  if (allowed) { return next(); }
  return res.redirect(paths.common.forbidden);
};

export { isJourneyAllowedMiddleware };
