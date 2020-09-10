import React from "react";
import { Redirect, Route, useAuth } from "../../utils";
import Loader from "../loader";

const SessionRoute = props => {
  const { session, loading } = useAuth();
  if (loading) {
    return <Loader />;
  }
  const companyUUID = localStorage.getItem("companyUUID");
  if (!session) {
    return <Redirect push to={companyUUID ? `/login/${companyUUID}` : "/"} />;
  }
  return <Route {...props} />;
};

export default SessionRoute;
