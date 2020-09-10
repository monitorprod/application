const logout = async ({ client }) => {
  await client.logout();
  localStorage.removeItem("companyUUID");
};

export default logout;
