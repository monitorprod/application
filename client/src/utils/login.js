const login = async ({ client, email, password, companyUUID }) => {
  let response;
  // console.log(">>> effect login", email, password, companyUUID)
  if (email && password && companyUUID) {
    response = await client.authenticate({
      strategy: "local",
      email,
      password,
      companyUUID
    });
    localStorage.setItem("companyUUID", companyUUID);
  } else {
    response = await client.authenticate({
      strategy: "jwt",
      accessToken: localStorage.getItem("monitorprod-jwt"),
      companyUUID: localStorage.getItem("companyUUID")
    });
  }
  const payload = await client.passport.verifyJWT(response.accessToken);
  return payload;
};

export default login;
