function UserInput({ placeholder, id, onChange }) {
  return (
    <>
      <div className="form-floating">
        <textarea
          className="form-control"
          placeholder={placeholder}
          id={id}
          onChange={onChange}
        ></textarea>
        <label htmlFor="floatingTextarea">{placeholder}</label>
      </div>
    </>
  );
}

export default UserInput;
