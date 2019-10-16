import { NextFunction, Request, Response, Router } from 'express';
import mockSectionsData from '../data/mockSectionsData.json';

import { paths } from '../paths';

function getTaskList(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: call CCD to get section statuses and remove mockSectionData
    const statusOverview = JSON.parse(JSON.stringify(mockSectionsData));
    res.render('task-list.njk', { data: statusOverview });
  } catch (e) {
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
