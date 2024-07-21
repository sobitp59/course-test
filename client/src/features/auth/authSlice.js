import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { redirect } from "react-router-dom";

// TODO : https://github.com/bezkoder/redux-toolkit-authentication/blob/master/src/app/services/auth.service.js
const initialState = {
  user: null,
  token: null,
};

export const registerUser = createAsyncThunk(
  "user/signup",
  async (formData, thunkAPI) => {
    const response = await fetch("http://localhost:3000/api/v1/user/signup", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data) {
        localStorage.setItem(
          "accessTokenUser",
          JSON.stringify(data?.accessToken)
        );
        localStorage.setItem(
          "refreshTokenUser",
          JSON.stringify(data?.refreshToken)
        );
        return data;
      }
    } else {
      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);
export const loginUser = createAsyncThunk(
  "user/login",
  async (formData, thunkAPI) => {
    const response = await fetch("http://localhost:3000/api/v1/user/login", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("response ", response);
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      console.log(data.data.user);
      console.log(data.data.accessToken);

      sessionStorage.setItem("token-user", data.data.accessToken);

      redirect("/");
      return data;
    } else {
      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    handleLogin: (state) => {
      console.log("STATE ", state);
      state.isAuthorized = !state.isAuthorized;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.fulfilled, () => {});
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isAuthorized = true;
    });
  },
});

export const { handleLogin } = authSlice.actions;
export default authSlice.reducer;
