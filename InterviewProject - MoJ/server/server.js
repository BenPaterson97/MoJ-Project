const ExampleTask = require("./utils/example_task");
const formatDateToYYYYMMDD = require("./utils/date_formatter");
const express = require("express");
const db = require("./utils/db");
const app = express();
const port = 5000;

app.use(express.json());

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tasks ORDER BY id ASC");

    // Format due_date for each row
    const formattedRows = result.rows.map((row) => ({
      ...row,
      due_date: formatDateToYYYYMMDD(row.due_date),
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

// Get a task by ID
app.get("/tasks/:id", async (req, res) => {
  const request_id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM tasks WHERE id = $1", [
      request_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const row = result.rows[0];
    const task = new ExampleTask(
      row.id,
      row.title,
      row.description,
      row.status,
      formatDateToYYYYMMDD(row.due_date),
      row.assignee
    );

    res.json(task);
  } catch (error) {
    console.error("Error retrieving task by ID:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Create a new task
app.post("/tasks", async (req, res) => {
  const { title, description, status, due_date, assignee } = req.body;

  if (!title || !status || !due_date) {
    return res
      .status(400)
      .json({ error: "Title, status, and due_date are required." });
  }

  try {
    const result = await db.query(
      `INSERT INTO tasks (title, description, status, due_date, assignee)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [title, description, status, due_date, assignee]
    );

    const row = result.rows[0];
    const task = new ExampleTask(
      row.id,
      row.title,
      row.description,
      row.status,
      formatDateToYYYYMMDD(row.due_date),
      row.assignee
    );

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete existing task
app.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const deleted = result.rows[0];
    res.json({ message: `Task "${deleted.title}" deleted.` });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Listen on port
app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

module.exports = app;
