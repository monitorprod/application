import React from "react";

// TODO make this work, stop rerendering when callbacks change
const SYS_ADMIN_HOME = "/sysadmin/companies";
const CLIENT_HOME = "/dashboard/machines";

const initialState = {
  email: "",
  password: "",
  loading: false,
  errors: ""
};

const TodosDispatch = React.createContext((state = initialState, { type, data }) => {
  switch (type) {
    case "handleChange":
      console.log(">> handleChange", { ...state, [data.name]: data.value });
      return { ...state, [data.name]: data.value };
    case "requestLogin":
      return { ...state, loading: true, errors: "" };
    case "handleLogin":
      try {
        console.log("handleLogin", state);
        if (state.companyUUID === "admin" && data.session.isAdmin) {
          return {
            ...state,
            loading: false,
            location: SYS_ADMIN_HOME
          };
        } else if (state.companyUUID !== "admin" && !data.session.isAdmin) {
          return { ...state, loading: false, location: CLIENT_HOME };
        } else {
          // await handleLogout();
          throw new Error();
        }
      } catch (e) {
        return {
          ...state,
          loading: false,
          errors: "As credenciais de usuário especificadas estão incorretas."
        };
      }
    default:
      return state;
  }
});

export default TodosDispatch;
