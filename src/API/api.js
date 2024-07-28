import axios from "axios";

const BACKEND_POINT =
  "https://geektrust.s3.ap-southeast-1.amazonaws.com/coding-problems/shopping-cart/catalogue.json";

export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${BACKEND_POINT}`);
    // console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
