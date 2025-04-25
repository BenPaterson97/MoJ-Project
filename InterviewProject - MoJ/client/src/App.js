import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import UserInput from "./components/UserInput.jsx";
import Button from "./components/Button.jsx";
import Table from "./components/Table.jsx";

const statusOptions = [
  "to do",
  "in progress",
  "in review",
  "blocked",
  "done",
  "cancelled",
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("add");
  const [taskIdToFetch, setTaskIdToFetch] = useState("");
  const [taskIdToDelete, setTaskIdToDelete] = useState("");
  const [fetchedTask, setFetchedTask] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "",
    due_date: "",
    assignee: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const response = await axios.get("/tasks");
      setTasks(response.data);
      setFetchedTask(response.data);
      setFetchError(null);
    } catch (err) {
      setError("Failed to fetch tasks.");
    }
  }

  const handleDataDisplay = () => {
    fetchTasks();
  };

  const fetchTaskById = async () => {
    if (!taskIdToFetch) {
      setFetchError("Please enter a task ID.");
      return;
    }

    try {
      const response = await axios.get(`/tasks/${taskIdToFetch}`);
      setFetchedTask([response.data]);
      setFetchError(null);
    } catch (error) {
      setFetchedTask(null);
      setFetchError(`Task with ID ${taskIdToFetch} not found.`);
      console.error(error);
    }
  };

  const handleNewTaskInputChange = (field) => (e) => {
    setTaskForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const pushTaskToDatabase = async (taskData) => {
    try {
      const response = await axios.post("/tasks", taskData);
      console.log("Task created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  };

  const handleAddTask = async () => {
    try {
      const newTask = await pushTaskToDatabase(taskForm);
      alert(`Task "${newTask.title}" added successfully!`);
      // Optional: reset form
      setTaskForm({
        title: "",
        description: "",
        status: "",
        due_date: "",
        assignee: "",
      });
      fetchTasks();
    } catch (err) {
      alert("Failed to create task.");
    }
  };

  const handleDelete = async () => {
    if (!taskIdToDelete) {
      alert("Please enter a task ID.");
      return;
    }

    try {
      await axios.delete(`/tasks/${taskIdToDelete}`);
      fetchTasks();
      alert(`Task "${taskIdToDelete}" deleted successfully!`);
    } catch (error) {
      alert(`Task with ID ${taskIdToDelete} not found.`);
      console.error(error);
    }
  };

  const renderInputs = () => {
    switch (activeTab) {
      case "add":
        return (
          <>
            <UserInput
              type="string"
              placeholder="Title"
              id="titleInput"
              onChange={handleNewTaskInputChange("title")}
            />
            <UserInput
              type="string"
              placeholder="Description"
              id="descriptionInput"
              onChange={handleNewTaskInputChange("description")}
            />
            <UserInput
              type="select"
              placeholder="Status"
              id="statusInput"
              options={statusOptions}
              onChange={handleNewTaskInputChange("status")}
            />
            <UserInput
              type="date"
              placeholder="Due Date"
              id="dueDateInput"
              onChange={handleNewTaskInputChange("due_date")}
            />
            <UserInput
              type="string"
              placeholder="Assignee"
              id="assigneeInput"
              onChange={handleNewTaskInputChange("assignee")}
            />
            <Button label="Submit Task" onClick={handleAddTask} />
          </>
        );
      case "delete":
        return (
          <>
            <UserInput
              type="number"
              placeholder="Task ID to Delete"
              id="deleteInput"
              onChange={(e) => setTaskIdToDelete(e.target.value)}
            />
            <Button label="Delete Task" onClick={handleDelete} />
          </>
        );
      case "view":
        return (
          <>
            <UserInput
              type="number"
              placeholder="Task ID to Search"
              id="searchInput"
              onChange={(e) => setTaskIdToFetch(e.target.value)}
            />
            <Button label="Search for Task" onClick={fetchTaskById} />
            <Button label="View All Tasks" onClick={handleDataDisplay} />
          </>
        );
      default:
        return null;
    }
  };

  const renderOutputs = () => {
    switch (activeTab) {
      case "add":
        return <Table tasks={tasks} />;
      case "delete":
        return <Table tasks={tasks} />;
      case "view":
        return (
          <>
            {fetchError ? (
              <p className="text-red-500">{fetchError}</p>
            ) : fetchedTask ? (
              <Table tasks={fetchedTask} />
            ) : (
              <p className="text-red-500">
                No task found or no task selected. Please click "View All Tasks"
                to reset, or try a different ID.
              </p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container text-center">
      <h1>Case Task Management System</h1>
      <div className="tabs mb-4">
        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Add Task
        </button>
        <button
          className={activeTab === "delete" ? "active" : ""}
          onClick={() => setActiveTab("delete")}
        >
          Delete Task
        </button>
        <button
          className={activeTab === "view" ? "active" : ""}
          onClick={() => setActiveTab("view")}
        >
          View Tasks
        </button>
      </div>

      <div className="row">
        <div className="col">{renderInputs()}</div>
        <div className="col-8">{renderOutputs()}</div>
      </div>
    </div>
  );
}
