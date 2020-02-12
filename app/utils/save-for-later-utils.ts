import { paths } from '../paths';

function shouldValidateWhenSaveForLater(body, ...fieldNames) {
  return !body.saveForLater || body.saveForLater && fieldNames.some(fieldName => body[fieldName] && body[fieldName] !== '');
}

function getNextPage(body, nextPage,req) {
  if (body.saveForLater) {
    req.session.appeal.application.isPartiallySaved = true;
    return paths.overview;
  }
  return nextPage;
}

export {
  shouldValidateWhenSaveForLater,
  getNextPage
};
