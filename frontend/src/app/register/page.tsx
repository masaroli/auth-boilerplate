"use client";

import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axios";
import { useState } from "react";

type RegisterDto = {
  fullName: string;
  email: string;
  password: string;
};

const registerUser = async (data: RegisterDto) => {
  const response = await axiosInstance.post("/api/auth/register", data);
  return response.data;
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterDto>({
    fullName: "",
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      console.log("User registered:", data);
      // You can redirect or show success message here
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <input
        name="fullName"
        placeholder="Full Name"
        value={form.fullName}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        name="email"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        name="password"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
