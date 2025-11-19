// import { useState } from "react";
// import { useUser } from "../lib/UserContext";
// import { useNavigate } from "react-router-dom";

// const users = [
//   { username: "admin", password: "admin123", role: "admin", displayName: "Admin User" },
//   { username: "agent1", password: "agent123", role: "agent", displayName: "Rajesh Kumar" },
//   { username: "agent2", password: "agent123", role: "agent", displayName: "Priya Sharma" },
// ];

// export default function Login() {
//   const [form, setForm] = useState({ username: "", password: "" });
//   const [error, setError] = useState("");
//   const { login } = useUser();
//   const navigate = useNavigate();

//   function handleChange(e: any) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   function handleSubmit(e: any) {
//     e.preventDefault();
//     const user = users.find(u => u.username === form.username && u.password === form.password);
//     if (user) {
//       login(user);
//       navigate("/leads");
//     } else {
//       setError("Invalid username or password");
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-[320px]">
//         <h2 className="text-2xl mb-4 font-bold">Login</h2>
//         {error && <div className="text-red-600 mb-2">{error}</div>}
//         <input
//           name="username"
//           placeholder="Username"
//           value={form.username}
//           onChange={handleChange}
//           className="border px-2 py-1 mb-2 w-full"
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           className="border px-2 py-1 mb-2 w-full"
//         />
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
//           Login
//         </button>
//         <div className="mt-3 text-xs text-gray-600">
//           Try: admin/admin123, agent1/agent123, agent2/agent123
//         </div>
//       </form>
//     </div>
//   );
// }



//Testing
import { useState } from "react";
import { useUser } from "../lib/UserContext";
import { useNavigate } from "react-router-dom";

const users = [
  { username: "admin", password: "admin123", role: "admin", displayName: "Admin User" },
  { username: "agent1", password: "agent123", role: "agent", displayName: "Rajesh Kumar" },
  { username: "agent2", password: "agent123", role: "agent", displayName: "Priya Sharma" },
];

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const user = users.find(
      (u) => u.username === form.username && u.password === form.password
    );
    if (user) {
      login(user); // user context must persist role and displayName!
      navigate("/leads");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-[320px]">
        <h2 className="text-2xl mb-4 font-bold">Login</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="border px-2 py-1 mb-2 w-full"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border px-2 py-1 mb-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Login
        </button>
        <div className="mt-3 text-xs text-gray-600">
          Try: admin/admin123, agent1/agent123, agent2/agent123
        </div>
      </form>
    </div>
  );
}
