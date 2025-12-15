'use strict';
import config from 'config';
import * as crypto from 'crypto';
const { scryptSync } = require('crypto');

const algorithm = 'aes-256-gcm';
const bufferSize = 16;
const iv = Buffer.alloc(bufferSize, 0);
const keyLen = 32;

const createToken = params => {
  const tokenKey = `${config.get('pcq.tokenKey')}`;
  let encrypted = '';

  if (tokenKey) {
    const key = scryptSync(tokenKey, 'salt', keyLen);
    Object.keys(params).forEach(p => {
      params[p] = String(params[p]);
    });
    const strParams = JSON.stringify(params);
    const cipher = crypto.createCipheriv(algorithm, key, iv as unknown as Uint8Array);
    encrypted = cipher.update(strParams, 'utf8', 'hex');
    encrypted += cipher.final('hex');
  }

  return encrypted;
};

export {
  createToken
};
