import { NextFunction, Request, Response, Router } from 'express';
import mockSectionsData from '../data/mockSectionsData.json';

import { paths } from '../paths';
import Logger from '../utils/logger';

const logLabel: string = 'controllers/task-list.ts';

function getTaskList(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    // TODO: call CCD to get section statuses and remove mockSectionData
    const statusOverview = JSON.parse(JSON.stringify(mockSectionsData));
    logger.trace('getTaskList', logLabel);
    res.render('task-list.njk', { data: statusOverview });
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function setupTaskListController(): Router {
  const router = Router();
  router.get(paths.taskList, getTaskList);
  return router;
}

export {
  setupTaskListController,
  getTaskList
};
