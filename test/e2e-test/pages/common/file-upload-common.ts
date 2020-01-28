module.exports = {
  fileUploadCommon(I) {
    Given(/^I choose a file that is "([^"]*)"$/, async (key: string) => {
      const scenario = {
        INVALID_TOO_BIG: 'invalid-file-too-big.png',
        INVALID_FORMAT: 'invalid-format-file.dat',
        VALID: 'valid-image-file.png'
      };
      await I.attachFile("input[type='file']", `/test/files/${scenario[key]}`);
    });
  }
};
