// backend/src/config/database.js
const mysql = require("mysql2/promise");
const knexLib = require("knex");

// MySQL连接池配置
const mySqlPool = mysql.createPool({
  user: "root",
  host: "localhost",
  password: "12345678",
  database: "shop",
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4",
  timezone: "+08:00",
});

// Knex配置
const knex = knexLib({
  client: "mysql2",
  connection: {
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "shop",
    charset: "utf8mb4",
    timezone: "+08:00",
  },
  pool: { min: 2, max: 10 },
});

// 使用 Knex 执行查询
const knexQuery = async (table, query = {}) => {
  try {
    const results = await knex(table).where(query);
    return results;
  } catch (error) {
    console.error("Knex query error:", {
      table,
      query,
      error: {
        message: error.message,
        code: error.code,
      },
    });
    throw error;
  }
};

// 简化查询函数
const executeQuery = async (query, params = []) => {
  const connection = await mySqlPool.getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error("Query execution error:", {
      query,
      params,
      error: {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
      },
    });
    throw error;
  } finally {
    connection.release();
  }
};

// 使用 Knex 的事务
const knexTransaction = async (callback) => {
  const trx = await knex.transaction();
  try {
    const result = await callback(trx); // 使用事务对象 `trx` 进行数据库操作
    await trx.commit();
    return result;
  } catch (error) {
    await trx.rollback();
    console.error("Knex transaction error:", {
      error: {
        message: error.message,
        code: error.code,
      },
    });
    throw error;
  }
};

// 事务函数
const executeTransaction = async (callback, isolationLevel = "SERIALIZABLE") => {
  const connection = await mySqlPool.getConnection();
  try {
    await connection.execute(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
    await connection.beginTransaction();

    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  mySqlPool,
  executeQuery,
  executeTransaction,
  knex, // 导出 Knex 实例
  knexQuery, // 导出 Knex 查询函数
  knexTransaction, // 导出 Knex 事务函数
};
