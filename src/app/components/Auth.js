"use client";

import { useState } from "react";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      // Đăng nhập
      if (!formData.username || !formData.password) {
        setError("Vui lòng nhập tên đăng nhập và mật khẩu");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users") || "{}");
      const user = users[formData.username];

      if (!user || user.password !== formData.password) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      onLogin(user);
    } else {
      // Đăng ký
      if (!formData.username || !formData.name) {
        setError("Tên đăng nhập và tên là bắt buộc");
        return;
      }

      if (!formData.password) {
        setError("Vui lòng nhập mật khẩu");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users") || "{}");

      if (users[formData.username]) {
        setError("Tên đăng nhập đã tồn tại");
        return;
      }

      const newUser = {
        username: formData.username,
        name: formData.name,
        phone: formData.phone || "",
        password: formData.password,
        rewardPoints: 0,
        savedAddresses: [],
      };

      users[formData.username] = newUser;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-600">
          Chăm Sóc Nhà Việt
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Dịch vụ dọn dẹp & sửa chữa uy tín
        </p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setFormData({
                username: "",
                name: "",
                phone: "",
                password: "",
              });
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              isLogin
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setFormData({
                username: "",
                name: "",
                phone: "",
                password: "",
              });
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
              !isLogin
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Đăng Ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên của bạn"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </button>
        </form>
      </div>
    </div>
  );
}
