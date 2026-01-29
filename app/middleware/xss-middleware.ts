import { NextFunction, Response } from 'express';
import type { Request } from 'express-serve-static-core';

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

function filterRequest(req: Request<Params>, res: Response, next: NextFunction) {
  Object.keys(req.body).forEach(formParameter => {
    req.body[formParameter] = DOMPurify.sanitize(req.body[formParameter], { ALLOWED_TAGS: [] }).trim();
  });

  next();
}
export {
  filterRequest
};
