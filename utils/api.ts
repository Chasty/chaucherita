const API_URL_DEV = "http://localhost:5007/api"; // Change to your backend URL if needed
const API_URL_PROD = "https://chaucherita.onrender.com/api";

export const API_URL = __DEV__ ? API_URL_DEV : API_URL_PROD;

//export const API_URL = API_URL_PROD;
