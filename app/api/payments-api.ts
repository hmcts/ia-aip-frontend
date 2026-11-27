import axios from 'axios';
import config from 'config';

const paymentsApiUrl: string = config.get('payments.apiUrl');

async function createCardPayment(headers, body, returnUrl, serviceRequestReference: string): Promise<any> {
  const url = `${paymentsApiUrl}/service-request/${serviceRequestReference}/card-payments`;
  const options = {
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken,
      'return-url': returnUrl,
      'service-callback-url': `${config.get('iaPayments.apiUrl')}/service-request-update`
    }
  };
  const response = await axios.post(url, body, options);
  return response.data;
}

async function paymentDetails(headers, paymentReference): Promise<any> {
  const uri = `${paymentsApiUrl}/card-payments/${paymentReference}/statuses`;
  const options = {
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken
    }
  };
  const response = await axios.get(uri, options);
  return JSON.stringify(response.data);
}

export {
  createCardPayment,
  paymentDetails
};
