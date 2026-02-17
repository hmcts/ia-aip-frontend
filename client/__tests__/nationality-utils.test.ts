import { expect, sinon } from '../../test/utils/testUtils';
import { addNationalityEventListener, addStatelessEventListener } from '../nationality-utils';

describe('nationality utils', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    document.body.innerHTML =
    `
      <input id="stateless" name="stateless" type="checkbox" value="stateless">
      <select class="govuk-select" id="nationality" name="nationality" aria-label="What is your nationality?">
          <option value="">Please select a nationality</option>
          <option value="AF">Afghanistan</option>
      </select>
    `;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('addNationalityEventListener @events', () => {
    it('should add event to nationality checkbox', () => {
      const addEventListenerStub: sinon.SinonStub = sandbox.stub(document.querySelector('#nationality'), 'addEventListener');
      addNationalityEventListener();

      expect(addEventListenerStub).to.have.been.calledWith('change');
    });
  });

  describe('addStatelessEventListener @events', () => {
    it('should add event to nationality checkbox', () => {
      const addEventListenerStub: sinon.SinonStub = sandbox.stub(document.querySelector('#stateless'), 'addEventListener');
      addStatelessEventListener();

      expect(addEventListenerStub).to.have.been.calledWith('change');
    });
  });
});
