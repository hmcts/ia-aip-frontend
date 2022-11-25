import axios from 'axios';
import { setupSecrets } from '../setupSecrets';

const config = setupSecrets();

const renderURL: string = config.get('docmosis.renderUrl');
const accessKey: string = config.get('docmosis.accessKey');
const customerServicesTelephone: string = config.get('customerServices.telephone');
const customerServicesEmail: string = config.get('customerServices.email');
const templates = config.get('docmosis.templates');

interface RenderedDocument {
  success: boolean;
  document?: Buffer;
  error?: string;
}

class DocmosisService {

  async render(templateKey: string, data): Promise<RenderedDocument> {
    return axios.post(renderURL, this.getParameters(templateKey, data).toString(), {
      responseType: 'arraybuffer'
    }).then(response => {
      if (response.status === 200) {
        return this.success(
          Buffer.from(response.data, 'binary'));
      } else {
        return this.failed(response.statusText);
      }
    }).catch(error => {
      return this.failed(error);
    });
  }

  private getParameters(key: string, data): URLSearchParams {
    return new URLSearchParams({
      'accessKey': accessKey,
      'templateName': templates[key],
      'outputName': 'tmp.pdf',
      'data': JSON.stringify(this.getData(data))
    });
  }

  private getData(data) {
    return {
      hmcts: '[userImage:hmcts.png]',
      ...data,
      customerServicesTelephone: customerServicesTelephone,
      customerServicesEmail: customerServicesEmail
    };
  }

  private failed(message: string): RenderedDocument {
    return { success: false, error: message };
  }

  private success(data: Buffer): RenderedDocument {
    return { success: true, document: data };
  }
}

export {
  RenderedDocument,
  DocmosisService
};
