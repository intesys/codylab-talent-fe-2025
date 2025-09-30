const MockKeycloak = {
  init: async () => true,
  login: () => console.log("Mock login"),
  logout: () => console.log("Mock logout"),
  token: "mock-token",
  tokenParsed: {
    preferred_username: "codylab",
    realm_access: {
      roles: ["user", "admin"],
    },
  },
  updateToken: async () => true,
  onTokenExpired: () => {},
};

export default MockKeycloak;
