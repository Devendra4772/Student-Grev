// src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">
        Grievance System
      </Link>

      <div>
        {!token ? (
          <>
            <Link className="btn btn-light mx-2" to="/">
              Register
            </Link>

            <Link className="btn btn-light" to="/login">
              Login
            </Link>
          </>
        ) : (
          <>
            <Link className="btn btn-info mx-2" to="/dashboard">
              Dashboard
            </Link>

            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;