import request from 'request-promise-native';

const getUserDetails = (authToken: string, args: IdamConfig) => {
  const userDetailsEndpoint = args.openId ? '/o/userinfo' : '/details';

  const options = {
    uri: `${args.idamApiUrl}${userDetailsEndpoint}`,
    headers: { Authorization: `Bearer ${authToken}` },
    json: true
  };

  return request.get(options);
};

export default getUserDetails;
