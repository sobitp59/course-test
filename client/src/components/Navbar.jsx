import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full text-white">
      <div className="flex w-[70vw] p-6 mx-auto justify-between ">
        <div>
          <Link
            to={"/"}
            className="text-2xl  font-semibold flex items-center gap-3"
          >
            <span className="w-10 h-10 bg-slate-600 flex justify-center items-center">
              🚀
            </span>
            Superdev{" "}
          </Link>
        </div>
        <div className="flex space-x-4">
          <Link to={"/"}>Home</Link>
          <Link to={"/courses"}>Courses</Link>
          <Link to={"/login"}>Login</Link>
          <Link to={"/signup"}>Signup</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
