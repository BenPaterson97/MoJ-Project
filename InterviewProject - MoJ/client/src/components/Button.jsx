const Button = ({ label, onClick }) => {
  return (
    <button className="btn btn-primary" aria-label={label} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;
