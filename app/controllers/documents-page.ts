import { NextFunction, Request, Response } from 'express';
import i18n from '../../../../locale/en.json';
import { paths } from '../../../paths';


function getDocuments(req: Request, res: Response, next: NextFunction) {
  const documents = [
    {
      name: 'Notice of Hearing',
      url: '/documents/notice-of-hearing'
    },
    {
      name: 'Appeal Documents',
      url: '/documents/appeal-documents'
    },
    {
      name: 'Supporting Evidence',
      url: '/documents/supporting-evidence'
    }
  ];

  return res.render('documents', {
    title: 'Documents',
    documents
  });
}

export {
  getDocuments
};