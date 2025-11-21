import axios from 'axios';

const getUserDetails = async (authToken: string, args: IdamConfig) => {
  const userDetailsEndpoint = args.openId ? '/o/userinfo' : '/details';
  const url = `${args.idamApiUrl}${userDetailsEndpoint}`;
  const options = {
    headers: { Authorization: `Bearer ${authToken}` }
  };
  const res = await axios.get(url, options);
  return res.data;
};

export default getUserDetails;
