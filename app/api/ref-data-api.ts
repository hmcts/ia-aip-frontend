import axios from 'axios';
import config from 'config';

function commonRefDataLov(headers, dataType): Promise<any> {
  const url = `${config.get('refData.apiUrl')}/refdata/commondata/lov/categories/${dataType}`;
  const options = {
    headers: {
      Authorization: headers.userToken,
      ServiceAuthorization: headers.serviceToken,
      'content-type': 'application/json'
    }
  };
  return axios.get(url, options);
}

export {
  commonRefDataLov
};
