import { NextFunction, Request, Response } from 'express';
import { paths } from '../../../app/paths';
import UpdateAppealService from '../../../app/service/update-appeal-service';
import Logger from '../../../app/utils/logger';
import { getNextPage, shouldValidateWhenSaveForLater } from '../../../app/utils/save-for-later-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('Save for later utils', () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let updateAppealService: Partial<UpdateAppealService>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  describe('getNextPage', () => {
    it('get next page when save for later clicked', () => {
      const nextPage = getNextPage({ saveForLater: 'saveForLater' }, 'defaultPath');

      expect(nextPage).to.eq(paths.overview + '?saved');
    });

    it('get next page when save and continue clicked', () => {
      const nextPage = getNextPage({}, 'defaultPath');

      expect(nextPage).to.eq('defaultPath');
    });
  });

  describe('shouldValidateWhenSaveForLater', () => {
    it('shouldValidateWhenSaveForLater is true when save for later not clicked', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ }, 'anyField');

      expect(shouldValidate).to.be.true;
    });

    it('shouldValidateWhenSaveForLater is true when save for later clicked and some data entered', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ saveForLater: 'saveForLater', field1: 'someValue' }, 'field1', 'field2');

      expect(shouldValidate).to.be.true;
    });

    it('shouldValidateWhenSaveForLater is false when save for later clicked and no data entered', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ saveForLater: 'saveForLater' }, 'field1', 'field2');

      expect(shouldValidate).to.be.false;
    });

    it('shouldValidateWhenSaveForLater is false when save for later clicked and data entered is blank', function () {
      const shouldValidate = shouldValidateWhenSaveForLater({ saveForLater: 'saveForLater', field1: '', field2: '' }, 'field1', 'field2');

      expect(shouldValidate).to.be.false;
    });
  });
});
