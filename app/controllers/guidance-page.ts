import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getGuidancePage(req: Request, res: Response, next: NextFunction) {
  try {
    // Pass the req.path into the function
    return res.render('guidance-pages/guidance-page.njk',{
      title: 'What is a Tribunal Caseworker?',
      titleText: 'A Tribunal Caseworker manages asylum and immigration appeals to make sure everything is ready for the Judge who decides your appeal if there is a hearing.',
      textAndBullets: [{ title: 'Hi', text: 'Hello' }, { title: 'Hi', text: 'Hello' }, { title: 'Hi', text: 'Hello' }, { title: 'Hi', text: 'Hello' }]
    });
  } catch (e) {
    next(e);
  }
}

function setupGuidancePages(): Router {
  const router = Router();
  router.get(paths.tribunalCaseworker, getGuidancePage);
  return router;
}

export {
    setupGuidancePages,
    getGuidancePage
};
