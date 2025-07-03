const isLocalhost = window.location.hostname.includes('localhost');

export const apiConfig = {
  azureBlobsUrl: isLocalhost
    ? "https://localhost:7203/api/"
    : "https://azureblobs20250623143905.azurewebsites.net/api/",

  customsApiUrl: isLocalhost
    ? "http://localhost:63012/api/"
    : "https://customsapi20250623140858.azurewebsites.net/api/",

  customsExternalApiUrl: isLocalhost
    ? "https://localhost:44308/api/"
    : "https://customsexternal20250624201845.azurewebsites.net/api/",

  customsdbApiUrl: isLocalhost
    ? "http://localhost:54748/api/"
    : "https://customsdbapi20250623133149.azurewebsites.net/api/"
};
