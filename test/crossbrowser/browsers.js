const browsers = {
  microsoftIE11: [
    {
      browserName: 'internet explorer',
      name: 'IE11',
      platform: 'Windows 10',
      version: '11.285'
    }
  ],
  microsoftEdge: [
    {
      browserName: 'MicrosoftEdge',
      name: 'Edge_Win10',
      platform: 'Windows 10',
      version: '18.17763'
    }
  ],
  chrome: [
    {
      browserName: 'chrome',
      name: 'WIN_CHROME_LATEST',
      platform: 'Windows 10',
      version: 'latest'
    },
    {
      browserName: 'chrome',
      name: 'MAC_CHROME_LATEST',
      platform: 'macOS 10.13',
      version: 'latest'
    }
  ]
  ,
  firefox: [
    {
      browserName: 'firefox',
      name: 'WIN_FIREFOX_LATEST',
      platform: 'Windows 10',
      version: 'latest'
    },
    {
      browserName: 'firefox',
      name: 'MAC_FIREFOX_LATEST',
      platform: 'macOS 10.13',
      version: 'latest'
    }
  ],
  safari: [
    {
      browserName: 'safari',
      name: 'SAFARI_LATEST',
      platform: 'macOS 10.13',
      version: 'latest',
      avoidProxy: true
    },
    {
      browserName: 'safari',
      name: 'SAFARI_11',
      platform: 'macOS 10.13',
      version: '11.1',
      avoidProxy: true
    }
  ]
};

module.exports = browsers;
