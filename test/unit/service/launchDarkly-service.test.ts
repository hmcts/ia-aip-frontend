import LaunchDarklyService from '../../../app/service/launchDarkly-service';
import { expect, sinon } from '../../utils/testUtils';

describe('launchDarkly-service', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('checks that the same instance is returned', async () => {
    const firstInstance = LaunchDarklyService.getInstance();
    const secondInstance = LaunchDarklyService.getInstance();

    expect(firstInstance).eq(secondInstance);
    LaunchDarklyService.close();
  });

  it('checks that getTestFlagValue returns true for known flags', () => {
    const instance = LaunchDarklyService.getInstance();
    const trueFlags = ['online-card-payments-feature', 'pcq-feature', 'aip-hearing-requirements-feature',
      'aip-hearing-bundle-feature', 'aip-ooc-feature', 'aip-upload-addendum-evidence-feature',
      'aip-make-application-feature', 'aip-ftpa-feature', 'dlrm-fee-remission-feature-flag',
      'dlrm-setaside-feature-flag', 'dlrm-refund-feature-flag', 'dlrm-internal-feature-flag', 'use-ccd-document-am'];
    for (const flag of trueFlags) {
      const result = instance.getTestFlagValue(flag);
      expect(result).eq(true);
    }
  });

  it('checks that getTestFlagValue returns false for unknown flags', () => {
    const instance = LaunchDarklyService.getInstance();
    const result = instance.getTestFlagValue('some-flag');
    expect(result).eq(false);
  });
});
