import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

    /*password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const login = async (formData) => {
    try{
      setIsLoading(true);
      // console.log("formData", formData);
      const response = await axios.post(`${config.endpoint}/auth/login`, formData);

      setFormData({
        username: "",
        password: ""
      });

      persistLogin(
        response.data.token,
        response.data.username,
        response.data.balance
      )
      const { success } = response.data;

      if (success) {
        enqueueSnackbar("Logged in successfully", { variant: "success" });
      }
      history.push("/");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar("Error occurred while login", { variant: "error" });
      }
    }
    finally{
      setIsLoading(false);
    }
  };

  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */

   const handleSubmit = (event) => {
    event.preventDefault();
    if (validateInput(formData)) {
      const userData = {
        username : formData.username,
        password: formData.password
      };
      // console.log("formData1", formData);
      login(userData);
      // console.log("formData2", formData);
    }
  };


  const validateInput = (data) => {
    // console.log("formData3", formData);
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "error" });
      return false;
    }

    // Check that password field is not empty
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "error" });
      return false;
    }
    return true;
  };


  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
        <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="User name"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            fullWidth
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
           {isLoading ? (<Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>):
            (<Button className="button" variant="contained" onClick={handleSubmit}>
            LOGIN TO QKART
           </Button>)}
          <p className="secondary-action">
            Don't have an account?{" "}
             <Link className="link" to="/register">
              Register now
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
