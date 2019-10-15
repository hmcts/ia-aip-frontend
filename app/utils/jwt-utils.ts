import jwt from 'jsonwebtoken';
import Logger from './logger';

const logger: Logger = new Logger();
const label: string = 'jwt-utils.ts';

export function decodeJWTToken(jwtToken: string) {
  let decoded;
  try {
    decoded = jwt.decode(jwtToken);
  } catch (err) {
    logger.exception(err, label);
    throw new Error(err);
  }
  return decoded;
}

/**
 * Checks whether a JWTToken is expired using an offset of 20 seconds,
 * this offset accounts for delays between sending/receiving requests
 * @param jwtToken the jwt token to be verified
 */
export function isJWTExpired(jwtToken: string) {
  let offset = 20 * 1000; // 20 seconds
  let dateNow = new Date();
  let isExpiredToken = false;

  const decoded = decodeJWTToken(jwtToken);

  if (decoded.exp < (dateNow.getUTCMilliseconds() - offset)) {
    isExpiredToken = true;
  }
  return isExpiredToken;
}
