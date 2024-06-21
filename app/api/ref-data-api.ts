import config from 'config';
import rp from 'request-promise';

function commonRefDataLov(headers, dataType): Promise<any> {
  const options = {
    uri: `${config.get('refData.apiUrl')}/refdata/commondata/lov/categories/${dataType}`,
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken,
      'content-type': 'application/json'
    }
  };
  return rp.get(options);
}

export {
  commonRefDataLov
};
