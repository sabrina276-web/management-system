export const auth = {
  isLoggedIn() {
    return localStorage.getItem("loggedIn") === "true";
  },

  login() {
    localStorage.setItem("loggedIn", "true");
  },

  logout() {
    localStorage.removeItem("loggedIn");
  },
};
