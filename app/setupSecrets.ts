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
  setSecret('secrets.ia.s2s-secret', 's2s.secret');
  setSecret('secrets.ia.launch-darkly-sdk-key', 'launchDarkly.sdkKey');
  setSecret('secrets.ia.ia-redis-connection-string', 'session.redis.url');
  setSecret('secrets.ia.ia-redis-access-key', 'session.redis.secret');
  setSecret('secrets.ia.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
  setSecret('secrets.ia.hearing-centre-bradford-email', 'hearingCentres.bradfordEmail');
  setSecret('secrets.ia.hearing-centre-newport-email', 'hearingCentres.newportEmail');
  setSecret('secrets.ia.hearing-centre-taylorhouse-email', 'hearingCentres.taylorhouseEmail');
  setSecret('secrets.ia.hearing-centre-northshields-email', 'hearingCentres.northshieldsEmail');
  setSecret('secrets.ia.hearing-centre-birmingham-email', 'hearingCentres.birminghamEmail');
  setSecret('secrets.ia.hearing-centre-hattoncross-email', 'hearingCentres.hattoncrossEmail');
  setSecret('secrets.ia.hearing-centre-glasgow-email', 'hearingCentres.glasgowEmail');

  return config;
};

export {
  setupSecrets
};
