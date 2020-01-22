import * as propertiesVolume from '@hmcts/properties-volume';
import config from 'config';
import { get, has, set } from 'lodash';

propertiesVolume.addTo(config);

const setSecret = (secretPath, configPath) => {
  // Only overwrite the value if the secretPath is defined
  if (has(config, secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
};

const setupSecrets = () => {
  setSecret('secrets.ia.idam-secret', 'idam.secret');
  setSecret('secrets.ia.addressLookupToken', 'addressLookup.token');
  setSecret('secrets.sscs.sscs-s2s-secret', 's2s.secret');

  return config;
};

export {
  setupSecrets
};
