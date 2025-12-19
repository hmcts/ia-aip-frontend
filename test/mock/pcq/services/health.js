module.exports = {
  path: '/health',
  method: 'GET',
  render: (req, res) => {
    res.send({ status: 'DOWN' });
  }
};


import { Mockttp } from 'mockttp';

export async function setupPcqHealth(server: Mockttp) {
  await server.forPost('/health').thenCallback(async () => {
    return {
      status: 200,
      json: {
        data: { status: 'DOWN' }
      }
    };
  });
}
