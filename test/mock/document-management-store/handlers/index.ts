import { setupCdamDeleteDocument } from './cdam-delete-document';
import { setupCdamUpload } from './cdam-upload';
import { setupDmDeleteDocument } from './dm-delete-document';
import { setupDmUpload } from './dm-upload';

export default [
  setupCdamUpload,
  setupCdamDeleteDocument,
  setupDmUpload,
  setupDmDeleteDocument
];
