import pool from "../config/db.js";

export class Task {
  static async getAll() {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(task) {
    const { name, status, deadline } = task;
    const result = await pool.query(
      "INSERT INTO tasks (name, status, deadline) VALUES ($1, $2, $3) RETURNING *",
      [name, status, deadline]
    );
    return result.rows[0];
  }

  static async update(id, task) {
    const { name, status, deadline } = task;
    const result = await pool.query(
      "UPDATE tasks SET name = $1, status = $2, deadline = $3 WHERE id = $4 RETURNING *",
      [name, status, deadline, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
  }
}
