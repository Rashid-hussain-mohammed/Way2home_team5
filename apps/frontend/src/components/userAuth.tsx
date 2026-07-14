import React, { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { signup, login } from "../api";

// Define an interface for the signup payload
interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  birthDate: string;
  phone?: string;
  avatar?: string;
  role: "STUDENT" | "LANDLORD" | "MODERATOR";
  about?: string;
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthDate: "",
    phone: "",
    about: "",
    role: "STUDENT" as "STUDENT" | "LANDLORD" | "MODERATOR",
  });

  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
  
    // Perform additional validation for signup
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (
        formData.role === "STUDENT" &&
        !formData.email.endsWith(".hs-fulda.de")
      ) {
        setError("Students must use a valid university email ending with .hs-fulda.de");
        return;
      }
    }
  
    try {
      if (isLogin) {
        // Login API call
        const response = await login(formData.email, formData.password);
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userRole", response.user.role);
  
        // Dispatch a custom event to trigger update
        window.dispatchEvent(new Event("authChange"));
  
        navigate("/");
      } else {
        // Signup API call
        const payload: SignupPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          birthDate: formData.birthDate,
          phone: formData.phone || undefined,
          about: formData.about || undefined,
          role: formData.role,
          avatar: undefined,
        };
        await signup(payload);
        alert("Signup successful! Please log in.");
        toggleAuthMode(); // Switch to login form
      }
    } catch (error) {
      console.error("Authentication Error:", error);
      setError(
        isLogin
          ? "Login failed. Please try again."
          : "Email is already in use. Try again with new email"
      );
    }
  };
  

  const toggleAuthMode = () => {
    setIsLogin((prevState) => !prevState);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      birthDate: "",
      phone: "",
      about: "",
      role: "STUDENT",
    });
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
  {/* Signup/Login Title Section */}
    <div className="bg-black text-white p-8 flex flex-col justify-center items-center text-center order-1 md:order-none">
    <h2 className="text-3xl font-bold mb-4">
      {isLogin ? "Welcome Back!" : "Create Account"}
    </h2>
    <p className="text-gray-300 mb-6">
      {isLogin ? "Haven't Signed up Yet? Register Now" : "Already registered? Login Here "}
    </p>
    <button
      onClick={toggleAuthMode}
      className="px-6 py-2 border-2 border-white rounded-full hover:bg-yellow-600 hover:text-black transition duration-300"
    >
      {isLogin ? "Sign Up" : "Login"}
    </button>

    <div className="mt-7"> 
      <img src="/Logo.png" style={{ height: "45px", width: "90px" }} className="mx-auto"/>
    </div>
  </div>

  {/* Form Section */}
  <div className="p-8 space-y-6 order-2 md:order-none">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
      {isLogin ? "Login" : "Sign Up"}
    </h2>

  
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-4">
                {error}
              </div>
            )}
  
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-gray-700 mb-2 text-sm"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-gray-700 mb-2 text-sm"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
  
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 mb-2 text-sm"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
  
              {/* Gender and Role on One Line */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-gray-700 mb-2 text-sm"
                    >
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required={!isLogin}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-gray-700 mb-2 text-sm"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required={!isLogin}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="LANDLORD">Landlord</option>
                      <option value="MODERATOR">Moderator</option>
                    </select>
                  </div>
                </div>
              )}
  
              {/* Birth Date and Phone on One Line */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="birthDate"
                      className="block text-gray-700 mb-2 text-sm"
                    >
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required={!isLogin}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-gray-700 mb-2 text-sm"
                    >
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>
              )}
  
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-700 mb-2 text-sm"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
              </div>
  
              {!isLogin && (
                <div className="mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-700 mb-2 text-sm"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>
              )}
  
              {!isLogin && (
                <div className="mb-4">
                  <label
                    htmlFor="about"
                    className="block text-gray-700 mb-2 text-sm"
                  >
                    About (Optional)
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              )}
  
              <button
                type="submit"
                className="w-full bg-black text-white px-6 border-2 border-black rounded-full py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

}


  export default AuthPage;