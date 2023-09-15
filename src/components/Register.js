import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

 
  const register = async (formData) => {
    try{
      setIsLoading(true);
      const response = await axios.post(`${config.endpoint}/auth/register`, formData);

      const { success } = response.data;
      setFormData({
        username : "",
        password :"",
        confirmPassword: ""
      });

      if (success) {
        enqueueSnackbar("Registration successful!", { variant: "success" });
        history.push("/login");
      } else {
        enqueueSnackbar("Username is already taken", { variant: "error" });
      }
    } catch (error) {

      if (error.response && error.response.status === 400 && error.response.data.message) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar("Error occurred while registering", { variant: "error" });
      }
    }
    finally{
      setIsLoading(false);
    }
  };

   const handleSubmit = (event) => {
    event.preventDefault();
    if (validateInput(formData)) {
      const userData = {
        username : formData.username,
        password: formData.password
      };
      // console.log("handled");
      register(userData);
    }
  };


  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "error" });
      return false;
    }

    // Check that username field is at least 6 characters long
    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", { variant: "error" });
      return false;
    }

    // Check that password field is not empty
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "error" });
      return false;
    }

    // Check that password field is at least 6 characters long
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", { variant: "error" });
      return false;
    }

    // Check that confirmPassword field matches the password field
    if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return false;
    }

    return true;
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
          <h2 className="title">Register</h2>
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
            helperText="Password must be at least 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
          />
           {isLoading ? (<Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>):
            (<Button className="button" variant="contained" onClick={handleSubmit}>
            Register Now
           </Button>)}
          <p className="secondary-action">
            Already have an account?{" "}
             <Link className="link" to="login">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
