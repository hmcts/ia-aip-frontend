import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../locale/en.json';
import { paths } from '../paths';
import { getGuidancePageText } from '../utils/guidance-page-utils';

function getCaseworkerPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('caseworker');
  try {
    return res.render('guidance-pages/guidance-page.njk', {
      showContactUs: true,
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      },
      page: text
    });
  } catch (e) {
    next(e);
  }
}

function getMoreHelpPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('helpWithAppeal');
  try {
    return res.render('guidance-pages/guidance-page.njk', {
      showContactUs: true,
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      },
      page: text
    });
  } catch (e) {
    next(e);
  }
}

function getHomeOfficeDocumentsPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('homeOfficeDocuments');
  try {
    return res.render('guidance-pages/guidance-page.njk', {
      showContactUs: true,
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      },
      page: text
    });
  } catch (e) {
    next(e);
  }
}

function getEvidenceToSupportAppealPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('evidenceToSupportAppeal');
  try {
    return res.render('guidance-pages/guidance-page.njk', {
      showContactUs: true,
      previousPage: {
        attributes: { onclick: 'history.go(-1); return false;' }
      },
      page: text
    });
  } catch (e) {
    next(e);
  }
}

function getDocumentsPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/documents.njk');
  } catch (e) {
    next(e);
  }
}

function getFourStagesPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/four-stages-of-process.njk');
  } catch (e) {
    next(e);
  }
}

function getNotificationsSupportPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/notifications.njk');
  } catch (e) {
    next(e);
  }
}

function getOfflineProcessesPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/offline-process.njk');
  } catch (e) {
    next(e);
  }
}

function getGuidanceSupportPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/guidance.njk');
  } catch (e) {
    next(e);
  }
}

function getHowToHelpPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/how-to-help.njk');
  } catch (e) {
    next(e);
  }
}

function getGiveFeedbackPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/how-to-give-feedback.njk');
  } catch (e) {
    next(e);
  }
}

function getWhatIsService(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/what-is-service.njk');
  } catch (e) {
    next(e);
  }
}

function getGettingStartedPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('guidance-pages/online-guidance-support/getting-started.njk');
  } catch (e) {
    next(e);
  }
}

function setupGuidancePagesController(): Router {
  const router = Router();
  router.get(paths.common.tribunalCaseworker, getCaseworkerPage);
  router.get(paths.common.moreHelp, getMoreHelpPage);
  router.get(paths.common.homeOfficeDocuments, getHomeOfficeDocumentsPage);
  router.get(paths.common.evidenceToSupportAppeal, getEvidenceToSupportAppealPage);
  router.get(paths.common.whatIsIt, getWhatIsService);
  router.get(paths.common.documents, getDocumentsPage);
  router.get(paths.common.fourStages, getFourStagesPage);
  router.get(paths.common.notifications, getNotificationsSupportPage);
  router.get(paths.common.giveFeedback, getGiveFeedbackPage);
  router.get(paths.common.howToHelp, getHowToHelpPage);
  router.get(paths.common.offlineProcesses, getOfflineProcessesPage);
  router.get(paths.common.guidance, getGuidanceSupportPage);
  router.get(paths.common.gettingStarted, getGettingStartedPage);
  return router;
}

export {
  setupGuidancePagesController,
  getEvidenceToSupportAppealPage,
  getHomeOfficeDocumentsPage,
  getMoreHelpPage,
  getCaseworkerPage,
  getWhatIsService,
  getDocumentsPage,
    getFourStagesPage,
  getNotificationsSupportPage,
  getGiveFeedbackPage,
  getHowToHelpPage ,
  getOfflineProcessesPage,
  getGuidanceSupportPage ,
  getGettingStartedPage
};
