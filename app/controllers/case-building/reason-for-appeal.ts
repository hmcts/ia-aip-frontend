import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { fileUploadValidation } from '../../utils/validations/file-upload-validations';
import { daysToWaitUntilContact } from '../appeal-application/confirmation-page';

function getReasonForAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/reason-for-appeal.njk', {
      previousPage: '/appellant-timeline'
    });
  } catch (e) {
    next(e);
  }
}

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/confirmation-page.njk', {
      date: daysToWaitUntilContact(14)
    });
  } catch (e) {
    next(e);
  }
}

function getReasonsUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/reasons-for-appeal-upload.njk', {});
  } catch (e) {
    next(e);
  }
}

function postUploadFileEvidence(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const validation = fileUploadValidation(req.file);
        if (validation) {
          return res.render('case-building/reasons-for-appeal/reasons-for-appeal-upload.njk', {
            error: validation,
            errorList: Object.values(validation)
          });
        }
        const { application } = req.session.appeal;

        await documentManagementService.uploadFile(req);
        // update appeal application and pass as options to view
        return res.render('case-building/reasons-for-appeal/reasons-for-appeal-upload.njk', {});

      }
    } catch (e) {
      next(e);
    }
  };
}

function postReasonForAppeal(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {

      // tslint:disable:no-console
      console.info(JSON.stringify('++++++++++++++++++++++++++++++++++++++++++++++++++'));
      console.info(JSON.stringify('postReasonForAppeal'));
      console.info(JSON.stringify('++++++++++++++++++++++++++++++++++++++++++++++++++'));
      console.info(JSON.stringify(req.body));
      console.info(JSON.stringify('++++++++++++++++++++++++++++++++++++++++++++++++++'));
      // Should submit evidence
      return res.redirect('case-building/reasons-for-appeal/check-and-send.njk');
    } catch (e) {
      next(e);
    }
  };
}

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './file-uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('file-upload');

function setupReasonsForAppealController(deps?: any): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.decision, getReasonForAppeal);
  router.post(paths.reasonsForAppeal.decision, postReasonForAppeal(deps.updateAppealService));
  router.post(paths.reasonsForAppeal.upload, upload, postUploadFileEvidence(deps.documentManagementService));
  router.get(paths.reasonsForAppeal.upload, getReasonsUploadPage);
  router.get(paths.reasonsForAppeal.confirmation, getConfirmationPage);

  return router;
}

export {
  setupReasonsForAppealController,
  getReasonForAppeal,
  postReasonForAppeal,
  getConfirmationPage,
  getReasonsUploadPage

};
