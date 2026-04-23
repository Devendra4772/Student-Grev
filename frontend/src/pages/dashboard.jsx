// src/pages/dashboard.jsx

import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [grievances, setGrievances] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Academic"
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    const res = await API.get("/grievances"); // ✅ FIXED
    setGrievances(res.data);
  };

  // ➕ Add grievance
  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post("/grievances", form);
    setForm({ title: "", description: "", category: "Academic" });
    fetchGrievances();
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    await API.delete(`/grievances/${id}`);
    fetchGrievances();
  };

  // 🔍 Search
  const handleSearch = async () => {
    if (!search) return fetchGrievances();

    const res = await API.get(`/grievances/search?title=${search}`);
    setGrievances(res.data);
  };

  // 🔄 Update Status (simple toggle)
  const handleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Resolved" : "Pending";

    await API.put(`/grievances/${id}`, { status: newStatus });
    fetchGrievances();
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>

      <button className="btn btn-danger mb-3" onClick={logout}>
        Logout
      </button>

      <hr />

      {/* ➕ Add Grievance */}
      <h4>Add Grievance</h4>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control my-2"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          required
        />

        <input
          className="form-control my-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          required
        />

        <select
          className="form-control my-2"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        >
          <option>Academic</option>
          <option>Hostel</option>
          <option>Transport</option>
          <option>Other</option>
        </select>

        <button className="btn btn-primary w-100">
          Submit
        </button>
      </form>

      <hr />

      {/* 🔍 Search */}
      <h4>Search</h4>
      <input
        className="form-control my-2"
        placeholder="Search by title"
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="btn btn-info mb-3" onClick={handleSearch}>
        Search
      </button>

      <hr />

      {/* 📋 Grievance List */}
      <h4>All Grievances</h4>

      <ul className="list-group">
        {grievances.map((g) => (
          <li
            key={g._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{g.title}</strong> <br />
              {g.description} <br />
              <small>
                {g.category} | {g.status}
              </small>
            </div>

            <div>
              <button
                className="btn btn-warning mx-1"
                onClick={() => handleStatus(g._id, g.status)}
              >
                Toggle Status
              </button>

              <button
                className="btn btn-danger"
                onClick={() => handleDelete(g._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;