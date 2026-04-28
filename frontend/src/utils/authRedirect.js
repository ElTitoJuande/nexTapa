export const getDefaultRouteByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "hostelero") return "/host/dashboard";
  return "/";
};

export const getAccountRouteByRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "hostelero") return "/host/dashboard";
  if (role === "cliente") return "/profile";
  return "/login";
};
