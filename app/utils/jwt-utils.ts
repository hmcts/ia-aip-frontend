import { jwtRepack } from './jwt-repack';
import Logger, { getLogLabel } from './logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export function decodeJWTToken(jwtToken: string) {
  let decoded;
  try {
    decoded = jwtRepack.decode(jwtToken);
  } catch (err) {
    logger.exception(err, logLabel);
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
  let offset = 5 * 60; // 5 minutes
  let isExpiredToken = false;

  const decoded = decodeJWTToken(jwtToken);

  const currentTime = Math.round(new Date().getTime() / 1000);

  if (decoded && decoded.exp < (currentTime + offset)) {
    isExpiredToken = true;
  }
  return isExpiredToken;
}
