import React from "react";
import { Redirect, Route, useAuth, lodashGet } from "../../utils";
import Loader from "../loader";

const AdminRoute = props => {
  const { session, loading } = useAuth();
  if (loading) {
    return <Loader />;
  }
  if (!lodashGet(session, "isAdmin")) {
    return <Redirect push to="/login/admin" />;
  }
  return <Route {...props} />;
};

export default AdminRoute;
