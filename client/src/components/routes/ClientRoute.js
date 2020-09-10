import React from "react";
import { Redirect, Route, useAuth } from "../../utils";
import Loader from "../loader";

const ClientRoute = props => {
  const { session, loading, hasAccess } = useAuth({
    privileges: props.permissions
  });
  if (loading) {
    return <Loader />;
  }
  const companyUUID = localStorage.getItem("companyUUID");
  if (!session || !hasAccess) {
    return <Redirect push to={companyUUID ? `/login/${companyUUID}` : "/"} />;
  }
  return <Route {...props} />;
};

export default ClientRoute;
