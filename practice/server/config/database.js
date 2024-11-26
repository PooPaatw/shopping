const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
  user: "root",
  host: "localhost",
  password: "12345678",
  database: "shop",
});

module.exports = { mySqlPool };
