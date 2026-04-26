const path = require("path");

let db;
let isPostgres = false;

if (process.env.DATABASE_URL) {
  const { Pool } = require("pg");
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
  isPostgres = true;
} else {
  const sqlite3 = require("sqlite3").verbose();
  const DB_FILE = path.join(__dirname, "database.sqlite");
  db = new sqlite3.Database(DB_FILE);
}

function init() {
  if (isPostgres) {
    return db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        registeredAt TEXT NOT NULL
      )
    `);
  }

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          registeredAt TEXT NOT NULL
        )`,
        (error) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });
  });
}

function getUsers() {
  if (isPostgres) {
    return db
      .query(
        "SELECT id, name, email, phone, registeredAt FROM users ORDER BY id DESC"
      )
      .then((result) => result.rows);
  }

  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, name, email, phone, registeredAt FROM users ORDER BY id DESC",
      [],
      (error, rows) => {
        if (error) return reject(error);
        resolve(rows);
      }
    );
  });
}

function addUser({ name, email, phone, registeredAt }) {
  if (isPostgres) {
    return db
      .query(
        "INSERT INTO users (name, email, phone, registeredAt) VALUES ($1, $2, $3, $4) RETURNING id",
        [name, email, phone, registeredAt]
      )
      .then((result) => ({ id: result.rows[0].id }));
  }

  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (name, email, phone, registeredAt) VALUES (?, ?, ?, ?)",
      [name, email, phone, registeredAt],
      function (error) {
        if (error) return reject(error);
        resolve({ id: this.lastID });
      }
    );
  });
}

function updateUser(id, { name, email, phone }) {
  if (isPostgres) {
    return db
      .query("UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4", [
        name,
        email,
        phone,
        id,
      ])
      .then((result) => ({ changes: result.rowCount }));
  }

  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, id],
      function (error) {
        if (error) return reject(error);
        resolve({ changes: this.changes });
      }
    );
  });
}

function deleteUser(id) {
  if (isPostgres) {
    return db
      .query("DELETE FROM users WHERE id = $1", [id])
      .then((result) => ({ changes: result.rowCount }));
  }

  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM users WHERE id = ?",
      [id],
      function (error) {
        if (error) {
          console.error("Delete error:", error);
          return reject(error);
        }
        console.log("Delete successful. Changes:", this.changes);
        resolve({ changes: this.changes || 0 });
      }
    );
  });
}

function isUniqueConstraintError(error) {
  return (
    error.code === "23505" || error.message.includes("UNIQUE constraint failed")
  );
}

module.exports = {
  init,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  isUniqueConstraintError,
};

