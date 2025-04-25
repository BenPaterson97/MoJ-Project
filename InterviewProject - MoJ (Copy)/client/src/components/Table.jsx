function Table({ tasks }) {
  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th scope="col">Status</th>
            <th scope="col">Due Date</th>
            <th scope="col">Assignee</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            return (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.status}</td>
                <td>{task.due_date}</td>
                <td>{task.assignee}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default Table;
