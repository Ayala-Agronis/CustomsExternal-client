// const isLocalhost = window.location.hostname.includes('localhost');

// // לסביבת ייצור
// // export const apiConfig = {
// //   azureBlobsUrl: isLocalhost
// //     ? "http://localhost:84/api/"
// //     // ? "https://localhost:7203/api/"
// //     : "https://azureblobs20250623143905.azurewebsites.net/api/",

// //   customsApiUrl: isLocalhost
// //     ? "http://localhost:82/api/"
// //     // ? "http://localhost:63012/api/"
// //     : "https://customsapi20250623140858.azurewebsites.net/api/",

// //   customsExternalApiUrl: isLocalhost
// //     ? "http://localhost:81/api/"
// //     // ? "https://localhost:44308/api/"
// //     : "https://customsexternal20250624201845.azurewebsites.net/api/",

// //   customsdbApiUrl: isLocalhost
// //     ? "http://localhost:83/api/"
// //     // ? "http://localhost:54748/api/"
// //     : "https://customsdbapi20250623133149.azurewebsites.net/api/",
// //   customsdocSendApiUrl: isLocalhost
// //     ? "http://localhost:85/api/"
// //     // ? "https://localhost:44363/api/"
// //     : "https://customsdbapi20250623133149.azurewebsites.net/api/"
// // };


// // // מעודכן לסביבת ייצור
// // export const apiConfig = {
// //   azureBlobsUrl:  "/azureblobs/api/",

// //   customsApiUrl:  "/customsapi/api/",

// //   customsExternalApiUrl:  "/customsexternal/api/",

// //   customsdbApiUrl:  "/customsdbapi/api/",

// //   customsdocSendApiUrl:  "/customsdocsend/api/"
// // };



// // לסביבת פיתוח
// export const apiConfig = {
//   azureBlobsUrl: isLocalhost
//     // ? "http://localhost:84/api/"
//     ? "https://localhost:7203/api/"
//     : "https://azureblobs20250623143905.azurewebsites.net/api/",

//   customsApiUrl: isLocalhost
//     // ? "http://localhost:82/api/"
//     ? "http://localhost:63012/api/"
//     : "https://customsapi20250623140858.azurewebsites.net/api/",

//   customsExternalApiUrl: isLocalhost
//     // ? "http://localhost:81/api/"
//     ? "https://localhost:44308/api/"
//     : "https://customsexternal20250624201845.azurewebsites.net/api/",

//   customsdbApiUrl: isLocalhost
//     // ? "http://localhost:83/api/"
//     ? "http://localhost:54748/api/"
//     : "https://customsdbapi20250623133149.azurewebsites.net/api/",
//   customsdocSendApiUrl: isLocalhost
//     // ? "http://localhost:85/api/"
//     ? "https://localhost:44363/api/"
//     : "https://customsdbapi20250623133149.azurewebsites.net/api/"
// };

const isLocalhost = window.location.hostname.includes('localhost');

export const apiConfig = {
  azureBlobsUrl: isLocalhost
    ? "https://localhost:7203/api/"
    : "https://customsil.co.il/azureblobs/api/",

  customsApiUrl: isLocalhost
    ? "http://localhost:63012/api/"
    : "https://customsil.co.il/customsapi/api/",

 customsExternalApiUrl: isLocalhost
  ? "https://localhost:44308/api/"
  : "https://customsexternalserver-cbbngvescma9awbh.westeurope-01.azurewebsites.net/api/",
  
  customsdbApiUrl: isLocalhost
    ? "http://localhost:54748/api/"
    : "https://customsil.co.il/customsdbapi/api/",

  customsdocSendApiUrl: isLocalhost
    ? "https://localhost:44363/api/"
    : "https://customsil.co.il/customsdocsend/api/"
};
