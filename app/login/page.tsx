"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login logic
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    // Example: set user in localStorage and redirect
    localStorage.setItem(
      "user",
      JSON.stringify({
        email,
        role: email.includes("teknisi") ? "teknisi" : "user",
      })
    );
    router.replace("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#f8fafc] p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-[#10316B]">Login</h1>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-[#10316B]">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#10316B]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-[#10316B]">
            Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#10316B]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#10316B] text-white py-2 rounded font-semibold hover:bg-[#0B409C] transition"
        >
          Login
        </button>
      </form>
    </main>
  );
}
