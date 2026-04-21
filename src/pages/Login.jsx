import React, { useState } from "react";
import { login } from "../data/firebaseService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      await login(email, password);
      window.location.reload(); // 🔥 más seguro que href
    } catch (error) {
      console.error(error);
      alert("Correo o contraseña incorrectos");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}