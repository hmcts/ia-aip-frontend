import { NextFunction, Request, Response } from 'express';

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

function filterRequest(req: Request, res: Response, next: NextFunction) {
  Object.keys(req.body).forEach(formParameter => {
    req.body[formParameter] = DOMPurify.sanitize(req.body[formParameter], { ALLOWED_TAGS: [] }).trim();
  });

  next();
}
export {
  filterRequest
};
