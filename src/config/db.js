require("dotenv").config();

const connection = require("serverless-mysql")({
  config: {
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_NAME,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    port: process.env.NODE_DB_PORT,
    connectTimeout: 60000, // 1 minute
  },
  backoff: "exponential",
  base: 5,
  cap: 200,
});

connection.connect((error) => {
  console.log("hello");
  if (error) {
    console.log("Failed to connect to the database. Exiting...");
    process.exit(1);
  } else {
    console.log("Connected to the database.");
  }
});

async function query(sql, params) {
  try {
    await connection.connect();
    const results = await connection.query(sql, params);
    await connection.end();
    return results;
  } catch (error) {
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Reconnecting...");
      return query(sql, params);
    } else {
      throw error;
    }
  }
}

const sampleQuery = async () => {
  try {
    const results = await query("SELECT * FROM users");
    console.log("results", results);
    return results;
  } catch (error) {
    console.log("error", error);
  }
};

sampleQuery();

module.exports = {
  connection,
  query,
};
