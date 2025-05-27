export const DB_NAME = "Wander_Trip_DB";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
  secure: process.env.NODE_ENV !== "development",
};

export const USER_ROLES_ENUM = {
  USER: "USER",
  ADMIN: "ADMIN",
};

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MILLISECONDS_PER_SECOND = 1000;

export const OAUTH_EXCHANGE_EXPIRY =
  15 * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND; // 15 minutes

export const ACCESS_TOKEN_EXPIRY =
  1 *
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND; // 1 day

export const REFRESH_TOKEN_EXPIRY =
  15 *
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND; // 15 days
