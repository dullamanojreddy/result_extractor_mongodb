import dotenv from "dotenv";

dotenv.config();

export const env = {
  useMysql: process.env.USE_MYSQL === "true",

  mysqlHost: process.env.MYSQL_HOST || "",
  mysqlPort: Number(process.env.MYSQL_PORT) || 3306,
  mysqlUser: process.env.MYSQL_USER || "",
  mysqlPassword: process.env.MYSQL_PASSWORD || "",
  mysqlDatabase: process.env.MYSQL_DATABASE || "",

  useMongoDB: process.env.USE_MONGODB === "true",

  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017",
  mongoDatabase: process.env.MONGO_DATABASE || "vce_results",

  port: Number(process.env.PORT) || 3000,

  defaultPrefix: process.env.DEFAULT_PREFIX || "",
  defaultStart: process.env.DEFAULT_START || "",
  defaultEnd: process.env.DEFAULT_END || "",

  defaultPortalUrl:
    process.env.DEFAULT_PORTAL_URL ||
    "",

  defaultFetchWorkers: Number(process.env.DEFAULT_FETCH_WORKERS) || 4,
  defaultParseWorkers: Number(process.env.DEFAULT_PARSE_WORKERS) || 2,
  defaultDbBatchSize: Number(process.env.DEFAULT_DB_BATCH_SIZE) || 5,
};