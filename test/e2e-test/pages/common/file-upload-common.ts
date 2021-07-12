module.exports = {
  fileUploadCommon(I) {
    const scenario = {
      INVALID_TOO_BIG: 'invalid-file-too-big.png',
      INVALID_FORMAT: 'invalid-format-file.dat',
      VALID: 'valid-image-file.png'
    };
    Given(/^I choose a file that is "([^"]*)" and click the "([^"]*)" button$/, async (key: string, button: string) => {
      await I.attachFile("input[type='file']", `/test/files/${scenario[key]}`);
      await I.click(button);
    });

    Given(/^I choose a file that is "([^"]*)"$/, async (key: string, button: string) => {
      await I.attachFile("input[type='file']", `/test/files/${scenario[key]}`);
    });
  }
};
