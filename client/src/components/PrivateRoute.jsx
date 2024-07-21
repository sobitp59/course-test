import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // const isAuthenticated = useSelector((state) => state.auth.isAuthorized);
  const isAuthenticated = sessionStorage.getItem("token-user");
  console.log(isAuthenticated);
  return !isAuthenticated ? <Navigate to={"/login"} /> : children;
};

export default PrivateRoute;
