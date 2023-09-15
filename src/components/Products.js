import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Stack,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart, { generateCartItemsFrom } from "./Cart";


const Products = () => {

  const [items, setItems] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  
  const [products, setProductsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimerout] = useState(0);
  const [filterProducts, setFilterProduct] = useState([]);

  const token = localStorage.getItem("token");

  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try{
      setIsLoading(true);
      const url = `${config.endpoint}/products`;
      const res = await axios.get(url);
      const productList = res.data;
      setProductsData(productList);
      setFilterProduct(productList);
      return res.data;
    }
    catch(e){
      if(e.data && e.response.status === 500){
        enqueueSnackbar(e.data.message, { variant: "error" });
      }
      else{
        enqueueSnackbar("Error occurred while login", { variant: "error" });
      }
      return null;
    }
    finally{
      setIsLoading(false);
    }
  };

  
   /* API endpoint - "GET /products/search?value=<search-query>"
   *
   */

  const performSearch = async (text) => {
    try{
      let url = `${config.endpoint}/products/search?value=${text}`;

      const res = await axios.get(url);
      setFilterProduct(res.data);
    }
    catch(e){
      if(e.response){
        if(e.response.status === 404){
          setFilterProduct([]);
        }
        if(e.response.status === 500){
          enqueueSnackbar(e.data.message, { variant: "error" });
          setFilterProduct(products);
        }
      }
      else{
        enqueueSnackbar("Error occurred", { variant: "error" });
      }
    }
  };

  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   */
  const debounceSearch = (event, debounceTimeout) => {

    const searchValue = event.target.value;

    if(debounceTimeout){
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout (() =>{
      performSearch(searchValue);
    }, 500);

    setDebounceTimerout(timeout);
  };


  useEffect(() =>{
    const onLoadHandler = async () => {
      const productsData = await performAPICall();
      const cartData = await fetchCart(token);
      const cartDetails = await generateCartItemsFrom(cartData, productsData);
      setItems(cartDetails);
    };
    onLoadHandler();
  }, []);


  /**
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {

      const url = `${config.endpoint}/cart`;
      const response = await axios.get(url, {
        headers:{
          Authorization : `Bearer ${token}`,
        },
      });
      return response.data;

    } catch (e) {
      if (e.response && e.response.status === 401) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };



  const isItemInCart = (items, productId) => {
    if(items){
      return items.findIndex((item) => item.productId === productId) !== -1;
    }
  };

  
  /* Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if(!token) {
      enqueueSnackbar(
        "Login to add an item to the cart",
        {variant : "warning"}
      );
      return;
    }

    if(options.preventDuplicate && isItemInCart(items, productId)){
      enqueueSnackbar(
        "Item already in cart. Use the cart slidebar to update quantity or remove item.",
        {
          variant : "warning"
        }
      );
      return;
    }

    try{
      const response = await axios.post(`${config.endpoint}/cart`,
        {productId, qty},
        {
          headers: {
            Authorization : `Bearer ${token}`,
          }
        }
      );

      const cartItems = generateCartItemsFrom(response.data, products);
      setItems(cartItems);
    }
    catch(e){
      console.error(e)
      if(e.response){
        enqueueSnackbar(e.response.data.message, {variant : "error"});
      }
      else{
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };


  return (
    <div>
      <Header>

        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            className :"search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange= {(e)=> debounceSearch(e,debounceTimeout)}
        />
      </Header>

      <TextField
          className="search-mobile"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange= {(e)=> debounceSearch(e,debounceTimeout)}
        />

      {/* Search view for mobiles */}
       <Grid container>
         <Grid 
            item 
            xs = {12}
            md = {token && products.length ? 9 : 12}
            className="product-grid"
          >
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
            {isLoading ? (<Stack display="flex" justifyContent="center">
              <CircularProgress />
              <p>Loading Products...</p>
            </Stack>):
            (
              <Grid container marginY="1rem" paddingX="1rem" spacing = {2}>
                {filterProducts.length ? (
                  filterProducts.map((data) => (  
                    <Grid item key={data._id} xs={12} sm={6} md={4} lg={3}>
                      <ProductCard 
                        product ={data} 
                        handleAddToCart = {async () =>{
                          await addToCart(
                            token,
                            items,
                            products,
                            data._id,
                            1,
                            {
                              preventDuplicate: true,
                            }
                          );
                        }}
                      />
                    </Grid>
                  ))):(
                    <Box className= "loading">
                      <SentimentDissatisfied color = "action" />
                      <h4 style = {{color:"#636363"}}>No products found</h4>
                    </Box>
                  )
                }
              </Grid>)}
         </Grid>

         {token  && (
          <Grid item xs ={12} md = {3} bgcolor ="#E9F5S1">
            <Cart
              hasCheckOutButton
              products = {products}
              items = {items}
              handleQuantity = {addToCart}
              isReadOnly = {false}
            />
          </ Grid>
         )}

       </Grid>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Footer />
    </div>
  );
};

export default Products;
