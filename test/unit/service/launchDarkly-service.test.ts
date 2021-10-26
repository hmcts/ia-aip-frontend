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
});
