const request = require("supertest");
const app = require("../server");
const db = require("../utils/db");

/* 
API Integrations tests
Requests:
    GET /tasks
    GET /tasks/:id
    POST /tasks
    DELETE /tasks/:id
*/
let taskId;
let maxId;

beforeAll(async () => {
  // Get the initial maxId
  const maxIdRequest = await db.query("SELECT MAX(id) FROM tasks");
  maxId = maxIdRequest.rows[0].max ?? 1;
  // Create a task in the database (or you can mock it)
  const result = await db.query(
    "INSERT INTO tasks (title, description, status, due_date, assignee) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    ["Test Task", "Test description", "to do", "2025-05-01", "Test User"]
  );
  taskId = result.rows[0].id; // Store the generated task ID
});

afterAll(async () => {
  // Ensure DB pool is closed after tests
  if (taskId) {
    await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);
  }
  await db.query(`SELECT setval('tasks_id_seq', $1, true)`, [maxId]);
  await db.pool.end();
});

describe("GET /tasks", () => {
  it("should return an array of tasks", async () => {
    const res = await request(app).get("/tasks");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("GET /tasks/:id", () => {
  it("should return a task by ID", async () => {
    const res = await request(app).get(`/tasks/${taskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(taskId);
    expect(res.body.title).toBe("Test Task");
    expect(res.body.description).toBe("Test description");
    expect(res.body.due_date).toBe("2025-05-01");
    expect(res.body.assignee).toBe("Test User");
  });

  it("should return 404 for non-existent task", async () => {
    const nonExistentId = 9999999; // ID that doesn't exist
    const res = await request(app).get(`/tasks/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });
});

describe("POST /tasks", () => {
  let newTaskId;

  afterAll(async () => {
    // Clean up: delete the test task from the DB
    if (newTaskId) {
      await db.query("DELETE FROM tasks WHERE id = $1", [newTaskId]);
    }
  });

  it("should create a new task and return it", async () => {
    const taskData = {
      title: "Integration Test Task",
      description: "This task is from an integration test",
      status: "to do",
      due_date: "2025-06-01",
      assignee: "Test User",
    };

    const res = await request(app).post("/tasks").send(taskData).expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe(taskData.title);
    expect(res.body.description).toBe(taskData.description);
    expect(res.body.status).toBe(taskData.status);
    expect(res.body.due_date).toBe("2025-06-01");
    expect(res.body.assignee).toBe(taskData.assignee);

    // Save ID for cleanup
    newTaskId = res.body.id;
  });

  it("should return 400 if required fields are missing", async () => {
    const badData = {
      description: "Missing title and due_date",
      status: "to do",
    };

    const res = await request(app).post("/tasks").send(badData).expect(400);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toBe("Title, status, and due_date are required.");
  });
});

describe("DELETE /tasks/:id", () => {
  let taskId;

  beforeAll(async () => {
    const result = await db.query(
      `INSERT INTO tasks (title, description, status, due_date, assignee)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ["Task to delete", "Description", "to do", "2025-06-01", "Tester"]
    );
    taskId = result.rows[0].id;
  });

  it("should delete the task and return confirmation message", async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Task "Task to delete" deleted\./);
  });

  it("should return 404 when trying to delete a non-existent task", async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });
});
