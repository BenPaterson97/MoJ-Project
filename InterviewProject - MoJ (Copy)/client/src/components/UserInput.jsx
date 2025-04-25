function UserInput({
  type = "string",
  placeholder,
  id,
  onChange,
  options = [],
}) {
  const commonProps = {
    id,
    placeholder,
    onChange,
    className: "form-control",
  };

  let inputElement;

  switch (type) {
    case "number":
      inputElement = <input type="number" {...commonProps} />;
      break;

    case "date":
      inputElement = <input type="date" {...commonProps} />;
      break;

    case "select":
      inputElement = (
        <select {...commonProps}>
          <option value="">Select an option</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
      break;

    case "string":
    default:
      inputElement = <textarea {...commonProps}></textarea>;
  }

  return (
    <div className="form-floating mb-3">
      {inputElement}
      <label htmlFor={id}>{placeholder}</label>
    </div>
  );
}

export default UserInput;
