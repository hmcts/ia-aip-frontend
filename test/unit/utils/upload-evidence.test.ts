import { Request, Response } from 'express';
import { askForMoreTimeEvidenceUploadConfig } from '../../../app/controllers/ask-for-more-time/ask-for-more-time';
import { expect, sinon } from '../../utils/testUtils';

let sandbox: sinon.SinonSandbox;
let req: Partial<Request>;
let evidence = { fileId: 'id', name: 'name' };

beforeEach(() => {
  sandbox = sinon.createSandbox();
  req = {
    query: {},
    body: {},
    session: {
      appeal: {
        application: {
          contactDetails: {}
        },
        reasonsForAppeal: {}
      }
    } as Partial<Appeal>,
    cookies: {},
    idam: {
      userDetails: {}
    }
  } as Partial<Request>;
});

afterEach(() => {
  sandbox.restore();
});

describe('askForMoreTimeEvidenceUploadConfig', () => {
  it('should add a new makeAnApplicationEvidence', () => {
    askForMoreTimeEvidenceUploadConfig.addEvidenceToSessionFunction(evidence, req as Request);
    expect(req.session.appeal.makeAnApplicationEvidence.length).to.equal(1);
  });

  it('should add a new makeAnApplicationEvidence then remove by fieldId', () => {
    askForMoreTimeEvidenceUploadConfig.addEvidenceToSessionFunction(evidence, req as Request);
    askForMoreTimeEvidenceUploadConfig.removeEvidenceFromSessionFunction('id', req as Request);
    expect(req.session.appeal.makeAnApplicationEvidence.length).to.equal(0);
  });
});
