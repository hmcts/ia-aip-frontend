import {
  fileUploadValidation,
  isBelowSizeLimitValidation,
  isValidFormatValidation
} from '../../../../app/utils/validations/file-upload-validations';
import { expect } from '../../../utils/testUtils';

describe('file-upload-validations', () => {
  describe('fileUploadValidation', () => {

    it('should validate successfully and return null validations', () => {

      const fileSizeInMb = 1;
      const sizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const file = {
        originalname: 'somefile.png',
        size: sizeInBytes
      } as Partial<Express.Multer.File>;

      const result = fileUploadValidation(file as Express.Multer.File);
      expect(result).to.be.null;
    });

    it('should fail validation and return unsupported format error message', () => {

      const fileSizeInMb = 1;
      const sizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const file = {
        originalname: 'somefile.dat',
        size: sizeInBytes
      } as Partial<Express.Multer.File>;

      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be a .jpg, .jpeg, .bmp, .tif, .tiff, .png, .pdf, .txt, .doc, .dot, .docx, .dotx, .xls, .xlt, .xla, .xlsx, .xltx, .xlsb, .ppt, .pot, .pps, .ppa, .pptx, .potx, .ppsx, .rtf, .csv'
      };

      const result = fileUploadValidation(file as Express.Multer.File);
      expect(result).to.be.deep.equal({ uploadFile: expectedError });
    });

    it('should fail validation and return file limit error message', () => {

      const fileSizeInMb = 101;
      const sizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const file = {
        originalname: 'somefile.png',
        size: sizeInBytes
      } as Partial<Express.Multer.File>;

      const expectedError: ValidationError = {
        href: '#uploadFile',
        key: 'uploadFile',
        text: 'The selected file must be smaller than 100MB'
      };

      const result = fileUploadValidation(file as Express.Multer.File);
      expect(result).to.be.deep.equal({ uploadFile: expectedError });
    });

  });

  describe('isValidFormatValidation', () => {

    it('should validate', () => {

      const fileSizeInMb = 1;
      const sizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const file = {
        originalname: 'somefile.png',
        size: sizeInBytes
      } as Partial<Express.Multer.File>;

      const result = isValidFormatValidation(file.originalname);
      expect(result).to.be.true;
    });

    it('should fail validation and return false', () => {
      const fileSizeInMb = 1;
      const sizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const file = {
        originalname: 'somefile.dat',
        size: sizeInBytes
      } as Partial<Express.Multer.File>;

      const result = isValidFormatValidation(file.originalname);

      expect(result).to.be.false;
    });
  });

  describe('isBelowSizeLimitValidation', () => {

    it('should validate', () => {

      const fileSizeInMb = 1;
      const sizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const file = {
        originalname: 'somefile.png',
        size: sizeInBytes
      } as Partial<Express.Multer.File>;

      const result = isBelowSizeLimitValidation(file.size);
      expect(result).to.be.true;
    });

    it('should fail validation and return false', () => {
      const fileSizeInMb = 101;
      const sizeInBytes: number = fileSizeInMb * 1000 * 1000;
      const file = {
        originalname: 'somefile.dat',
        size: sizeInBytes
      } as Partial<Express.Multer.File>;

      const result = isBelowSizeLimitValidation(file.size);

      expect(result).to.be.false;
    });
  });

});
