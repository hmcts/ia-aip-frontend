module.exports = function() {
  Before((test) => {
    test.retries(5);
  });
  return actor({
  });
}
