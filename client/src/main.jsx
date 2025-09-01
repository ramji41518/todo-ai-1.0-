import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import api from "./api/axios";
import { setMe, clearUser } from "./store/userSlice";
import "./index.css";

function BootMe() {
  const dispatch = useDispatch();
  useEffect(() => {
    api
      .get("/auth/me")
      .then((r) => dispatch(setMe(r.data.user)))
      .catch(() => dispatch(clearUser()));
  }, [dispatch]);
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <BootMe />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
