import { decode, jwt } from 'jsonwebtoken';

export const jwtRepack = {
  ...jwt,
  decode
};
