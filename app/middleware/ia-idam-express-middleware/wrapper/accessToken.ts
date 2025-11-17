import axios from 'axios';

const requestDefaults = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};
const formDefaults = { grant_type: 'authorization_code' };

const accessToken = async (options = {}, args: IdamConfig) => {
  if (args.openId) {
    const clientFormData = {
      client_id: args.idamClientID,
      client_secret: args.idamSecret
    };
    const uri = `${args.idamApiUrl}/o/token`;
    const form = { ...formDefaults, ...options, ...clientFormData };
    const body = new URLSearchParams(form as Record<string, string>).toString();
    let res = await axios.post(uri, body, requestDefaults);
    return res.data;
  } else {
    const uri = `${args.idamApiUrl}/oauth2/token`;
    const form = { ...formDefaults, ...options };
    const body = new URLSearchParams(form as Record<string, string>).toString();
    const auth = {
      username: args.idamClientID,
      password: args.idamSecret
    };
    let res1 = await axios.post(uri, body, { ...requestDefaults, auth });
    return res1.data;
  }
};

export default accessToken;
