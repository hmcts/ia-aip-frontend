import { paths } from '../paths';

function shouldValidateWhenSaveForLater(body, ...fieldNames) {
  return !body.saveForLater || body.saveForLater && fieldNames.some(fieldName => body[fieldName] && body[fieldName] !== '');
}

function getNextPage(body, nextPage) {
  return body.saveForLater ? paths.common.overview + '?saved' : nextPage;
}

export {
  shouldValidateWhenSaveForLater,
  getNextPage
};
