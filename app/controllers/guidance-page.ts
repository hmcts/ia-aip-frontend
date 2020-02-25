import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { getGuidancePageText } from '../utils/guidance-page-utils';

function getCaseworkerPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('caseworker');
  try {
    return res.render('guidance-pages/guidance-page.njk',{
      showContactUs: true,
      previousPage: '/',
      page: text});
  } catch (e) {
    next(e);
  }
}

function getMoreHelpPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('helpWithAppeal');
  try {
    return res.render('guidance-pages/guidance-page.njk',{
      showContactUs: true,
      previousPage: '/',
      page: text});
  } catch (e) {
    next(e);
  }
}

function getHomeOfficeDocumentsPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('homeOfficeDocuments');
  try {
    return res.render('guidance-pages/guidance-page.njk',{
      showContactUs: false,
      previousPage: '/',
      page: text});
  } catch (e) {
    next(e);
  }
}

function getEvidenceToSupportAppealPage(req: Request, res: Response, next: NextFunction) {
  const text = getGuidancePageText('evidenceToSupportAppeal');
  try {
    return res.render('guidance-pages/guidance-page.njk',{
      showContactUs: true,
      previousPage: '/',
      page: text});
  } catch (e) {
    next(e);
  }
}

function setupGuidancePagesController(): Router {
  const router = Router();
  // TODO Add all pages to path and functions
  router.get(paths.tribunalCaseworker, getCaseworkerPage);
  router.get(paths.moreHelp, getMoreHelpPage);
  router.get(paths.homeOfficeDocuments, getHomeOfficeDocumentsPage);
  router.get(paths.evidenceToSupportAppeal, getEvidenceToSupportAppealPage);
  return router;
}

export {
  setupGuidancePagesController,
  getEvidenceToSupportAppealPage,
  getHomeOfficeDocumentsPage,
  getMoreHelpPage,
  getCaseworkerPage
};
