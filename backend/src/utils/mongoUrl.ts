/**
 * Builds a MongoDB Atlas connection string with an URL-encoded password.
 * Use component env vars when the password contains special characters (@, #, /, etc.).
 */
export function buildMongoUrl(
  username: string,
  password: string,
  host: string,
  database: string
): string {
  const encodedUser = encodeURIComponent(username);
  const encodedPassword = encodeURIComponent(password);
  const normalizedHost = host.replace(/^mongodb(\+srv)?:\/\//, "");
  const hostWithDb = normalizedHost.includes("/")
    ? normalizedHost
    : `${normalizedHost}/${database}`;

  return `mongodb+srv://${encodedUser}:${encodedPassword}@${hostWithDb}?retryWrites=true&w=majority`;
}

/**
 * Returns the connection string unchanged if it already looks valid.
 * Component-based construction is preferred when passwords contain special chars.
 */
export function resolveMongoUrl(
  mongoUrl: string | undefined,
  components: {
    username?: string;
    password?: string;
    host?: string;
    database: string;
  }
): string {
  if (components.username && components.password && components.host) {
    return buildMongoUrl(
      components.username,
      components.password,
      components.host,
      components.database
    );
  }

  if (mongoUrl) {
    return mongoUrl;
  }

  throw new Error(
    "MongoDB connection not configured. Set MONGO_URL or MONGO_USERNAME + MONGO_PASSWORD + MONGO_HOST."
  );
}
