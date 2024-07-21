import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, redirect, useNavigate } from "react-router-dom";
import { handleLogin, loginUser } from "../features/auth/authSlice";
import { toast } from "sonner";

const Login = () => {
  const isLoggedIn = useSelector((state) => state.auth.isAuthorized);
  const dispatch = useDispatch();
  let navigate = useNavigate();

  console.log("Logged in ", isLoggedIn ? "yes" : "no");

  async function login(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const fromEntries = Object.fromEntries(formData);

    dispatch(loginUser(fromEntries))
      .unwrap()
      .then(() => {
        navigate("/courses");
        // window.location.reload();
      });
  }

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center relative">
      <form
        onSubmit={login}
        className="w-[90vw] md:w-[500px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  h-[600px] flex flex-col bg-zinc-100 rounded-xl"
      >
        <section className="flex flex-col gap-4 justify-center items-center h-full">
          <label htmlFor="" id="email">
            <input
              type="email"
              for="email"
              name="email"
              placeholder="Enter email"
              className="bg-transparent border-b-2"
            />
          </label>
          <label htmlFor="" id="password">
            <input
              type="password"
              for="password"
              name="password"
              placeholder="Enter password"
              className="bg-transparent border-b-2"
            />
          </label>
          <button className="bg-yellow-500 px-6 py-2 rounded-md">Login</button>
          <div>
            <p>Don't have an account?</p>
            <Link to={"/register"}>Sign up</Link>
          </div>
        </section>
      </form>
    </div>
  );
};

export default Login;
