import axios from 'axios';
import { DocmosisService } from '../../../app/service/docmosis-service';
import { expect, sinon } from '../../utils/testUtils';

describe('docmosis-service', () => {
  let sandbox: sinon.SinonSandbox;
  let axiosStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('DocmosisService', () => {
    it('render returns 400', async () => {
      axiosStub = sandbox.stub(axios, 'post').returns(Promise.resolve({ status: 400, statusText: 'status-message' }));

      const response = await new DocmosisService().render('template-key', { 'field-name': 'field-value' });

      expect(response.success).to.be.eq(false);
      expect(response.error).to.be.eq('status-message');
    });

    it('render returns 200', async () => {
      axiosStub = sandbox.stub(axios, 'post').returns(Promise.resolve({ status: 200, statusText: 'OK', data:  'pdf-file' }));

      const response = await new DocmosisService().render('template-key', { 'field-name': 'field-value' });

      expect(response.success).to.be.eq(true);
      expect(response.document).to.deep.equal(Buffer.from('pdf-file', 'binary'));
    });

    it('render throws error', async () => {
      const error = new Error('error-message');
      axiosStub = sandbox.stub(axios, 'post').returns(Promise.reject(error));

      const response = await new DocmosisService().render('template-key', {});

      expect(response.success).to.be.eq(false);
      expect(response.error).to.be.eq(error);
    });
  });

});
