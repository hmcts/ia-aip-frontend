module.exports = {
  fileUploadCommon(I) {
    Given(/^I choose a file that is "([^"]*)" and click the "([^"]*)" button$/, async (key: string, button: string) => {
      const scenario = {
        INVALID_TOO_BIG: 'invalid-file-too-big.png',
        INVALID_FORMAT: 'invalid-format-file.dat',
        VALID: 'valid-image-file.png'
      };
      await I.attachFile("input[type='file']", `/test/files/${scenario[key]}`);
      await I.click(button);
    });
  }
};
