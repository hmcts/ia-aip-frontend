import config from 'config';
import rp from 'request-promise';

function createCardPayment(headers, body, returnUrl): Promise<any> {
  const options = {
    uri: `${config.get('payments.apiUrl')}/card-payments`,
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken,
      'return-url': returnUrl,
      'service-callback-url': `${config.get('iaPayments.apiUrl')}/payment-update`
    },
    body,
    json: true
  };
  return rp.post(options);
}

function paymentDetails(headers, paymentReference): Promise<any> {
  const options = {
    uri: `${config.get('payments.apiUrl')}/card-payments/${paymentReference}/statuses`,
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken
    }
  };
  return rp.get(options);
}

export {
  createCardPayment,
  paymentDetails
};
