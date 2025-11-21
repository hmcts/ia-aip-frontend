import axios from 'axios';
import config from 'config';

function createCardPayment(headers, body, returnUrl): Promise<any> {
  const url = `${config.get('payments.apiUrl')}/card-payments`;
  const options = {
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken,
      'return-url': returnUrl,
      'service-callback-url': `${config.get('iaPayments.apiUrl')}/payment-updates`
    }
  };
  return axios.post(url, body, options);
}

function paymentDetails(headers, paymentReference): Promise<any> {
  const url = `${config.get('payments.apiUrl')}/card-payments/${paymentReference}/statuses`;
  const options = {
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken
    }
  };
  return axios.get(url, options);
}

export {
  createCardPayment,
  paymentDetails
};
