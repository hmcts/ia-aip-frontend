import axios from 'axios';
import config from 'config';

async function createCardPayment(headers, body, returnUrl): Promise<any> {
  const url = `${config.get('payments.apiUrl')}/card-payments`;
  const options = {
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken,
      'return-url': returnUrl,
      'service-callback-url': `${config.get('iaPayments.apiUrl')}/payment-updates`
    }
  };
  const response = await axios.post(url, body, options);
  return JSON.stringify(response.data);
}

async function paymentDetails(headers, paymentReference): Promise<any> {
  const uri = `${config.get('payments.apiUrl')}/card-payments/${paymentReference}/statuses`;
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
