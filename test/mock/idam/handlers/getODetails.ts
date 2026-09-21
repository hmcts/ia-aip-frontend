import workerThreads from 'node:worker_threads';
import { Mockttp } from 'mockttp';
import cache from '../../cache';
import { emailToUserId } from './getDetails';

const defaultUserId = '1';

export async function setupGetODetails(server: Mockttp) {
  await server.forGet('/o/userinfo').thenCallback(async () => {
    const workerThread = workerThreads.threadId === 0 ? 0 : workerThreads.threadId - 1;
    const email = cache.get(`email-${workerThread}`);
    const uid = emailToUserId[email] || defaultUserId;
    return {
      statusCode: 200,
      json: {
        uid,
        email,
        sub: email,
        name: 'John Smith',
        forename: 'John',
        surname: 'Smith'
      }
    };
  });
}
