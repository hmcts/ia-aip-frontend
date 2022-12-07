import axios from 'axios';
import { expect } from 'chai';
import sinon from 'sinon';
import { DocmosisService } from '../../../app/service/docmosis-service';

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

      let response = await new DocmosisService().render('template-key', { 'field-name': 'field-value' });

      expect(response.success).to.be.eq(false);
      expect(response.error).to.be.eq('status-message');
    });

    it('render returns 200', async () => {
      axiosStub = sandbox.stub(axios, 'post').returns(Promise.resolve({ status: 200, statusText: 'OK', data:  'pdf-file' }));

      let response = await new DocmosisService().render('template-key', { 'field-name': 'field-value' });

      expect(response.success).to.be.eq(true);
      expect(response.document).to.deep.equal(Buffer.from('pdf-file', 'binary'));
    });

    it('render throws error', async () => {
      axiosStub = sandbox.stub(axios, 'post').returns(Promise.reject('error-message'));

      let response = await new DocmosisService().render('template-key', {});

      expect(response.success).to.be.eq(false);
      expect(response.error).to.be.eq('error-message');
    });
  });

});
