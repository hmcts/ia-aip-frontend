import axios from 'axios';
import { setupSecrets } from '../setupSecrets';
import { isJWTExpired } from '../utils/jwt-utils';
import Logger, { getLogLabel } from '../utils/logger';

const config = setupSecrets();
const idamBaseUrl: string = config.get('idam.apiUrl');
const idamClientId: string = config.get('microservice');
const idamClientSecret: string = config.get('idam.secret');
const idamScope: string = 'openid profile roles';
const usernameSystemCaseworker: string = config.get('systemUser.username');
const passwordSystemCaseworker: string = config.get('systemUser.password');

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export class SystemAuthenticationService {
  private systemCaseworkerToken: string;
  private systemCaseworkerId: string;

  async getCaseworkSystemToken(): Promise<string> {
    if (this.systemCaseworkerToken === undefined || isJWTExpired(this.systemCaseworkerToken)) {
      this.systemCaseworkerToken = await this.requestCaseworkSystemToken();
    }
    return this.systemCaseworkerToken;
  }

  private requestCaseworkSystemToken(): Promise<string> {
    const idamParams = new URLSearchParams();
    idamParams.append('grant_type', 'password');
    idamParams.append('client_id', idamClientId);
    idamParams.append('client_secret', idamClientSecret);
    idamParams.append('username', usernameSystemCaseworker);
    idamParams.append('password', passwordSystemCaseworker);
    idamParams.append('scope', idamScope);

    return axios.post(`${idamBaseUrl}/o/token`, idamParams)
      .then(function (response) {
        return response.data.access_token;
      })
      .catch(function (error) {
        logger.exception(error, logLabel);
      });
  }

  async getCaseworkSystemUUID(accessToken: string): Promise<string> {
    if (this.systemCaseworkerId === undefined) {
      this.systemCaseworkerId = await this.requestCaseworkSystemUUID(accessToken);
    }
    return this.systemCaseworkerId;
  }

  private requestCaseworkSystemUUID(accessToken: string): Promise<string> {
    return axios.get(`${idamBaseUrl}/o/userinfo`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(function (response) {
      return response.data.uid;
    }).catch(function (error) {
      logger.exception(error, logLabel);
    });
  }
}
