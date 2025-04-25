class ExampleTask {
  constructor(id, title, description, status, due_date, assignee) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.due_date = due_date;
    this.assignee = assignee;
  }
  isOverdue() {
    return new Date(this.due_date) < new Date() && this.status !== "complete";
  }
}

module.exports = ExampleTask;
