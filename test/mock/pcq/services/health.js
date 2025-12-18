module.exports = {
  path: '/health',
  method: 'GET',
  render: (req, res) => {
    res.send({ status: 'DOWN' });
  }
};
