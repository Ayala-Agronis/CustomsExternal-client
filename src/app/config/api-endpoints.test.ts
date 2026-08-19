const isLocalhost = window.location.hostname.includes('localhost');

export const apiConfig = {
  azureBlobsUrl: isLocalhost
    ? 'https://localhost:7203/api/'
    : 'https://api.customsil.co.il/azureblobs/api/',

  customsApiUrl: isLocalhost
    ? 'http://localhost:63012/api/'
    : 'https://api.customsil.co.il/customsapi-test/api/',

  customsExternalApiUrl: isLocalhost
    ? 'https://localhost:44308/api/'
    : // : "https://customsexternalserver-cbbngvescma9awbh.westeurope-01.azurewebsites.net/api/",
      // : "https://sapi.customsil.co.il/api/",
      'https://customsexternalserver-test-egdvckfdcbbxauec.westeurope-01.azurewebsites.net/api/',

  customsdbApiUrl: isLocalhost
    ? 'http://localhost:54748/api/'
    : 'https://api.customsil.co.il/customsdbapi-test/api/',

  customsdbSignalRUrl: isLocalhost
    ? 'http://localhost:54748'
    : 'https://api.customsil.co.il/customsdbapi-test',

  customsdocSendApiUrl: isLocalhost
    ? 'https://localhost:44363/api/'
    : 'https://api.customsil.co.il/customsdocsend/api/',
};
