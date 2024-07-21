import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { registerUser } from "../features/auth/authSlice";

const Signup = () => {
  const dispatch = useDispatch();

  function handleRegister(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formEntries = Object.fromEntries(formData);

    console.log(formEntries);

    dispatch(registerUser(formEntries));
  }
  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center relative">
      <form
        onSubmit={handleRegister}
        className="w-[90vw] md:w-[500px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  h-[600px] flex flex-col bg-zinc-100 rounded-xl"
      >
        <section className="flex flex-col gap-4 justify-center items-center h-full">
          <label htmlFor="" id="username">
            <input
              type="text"
              for="username"
              name="username"
              placeholder="Enter username"
              className="bg-transparent border-b-2"
            />
          </label>
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
          <button className="bg-yellow-500 px-6 py-2 rounded-md">
            Register
          </button>
          <div>
            <p>Already have an account?</p>
            <Link to={"/login"}>Login</Link>
          </div>
        </section>
      </form>
    </div>
  );
};

export default Signup;
