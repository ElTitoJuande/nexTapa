import User from "../../models/User.model.js";

const createdUserEmails = new Set();

export const trackCreatedUserEmail = (email) => {
  if (typeof email !== "string" || !email.trim()) return;
  createdUserEmails.add(email.trim().toLowerCase());
};

export const cleanupCreatedUsers = async () => {
  if (createdUserEmails.size === 0) {
    return;
  }

  const emails = [...createdUserEmails];
  createdUserEmails.clear();

  await User.deleteMany({ email: { $in: emails } });
};

export const createTestUser = async (overrides = {}) => {
  const {
    emailPrefix = "auth",
    name = "Auth Test User",
    email = `${emailPrefix}.${Date.now()}.${Math.round(Math.random() * 1e6)}@nextapa.com`,
    password = "Pass12345!",
    ...rest
  } = overrides;

  const user = await User.create({
    name,
    email,
    password,
    ...rest,
  });

  trackCreatedUserEmail(user.email);

  return { user, password };
};
