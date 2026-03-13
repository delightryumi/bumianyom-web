"use client";

"use client";

import React, { useState } from "react";
import { useLogin } from "./useLogin";
import { Mail, Lock, User } from "lucide-react";
import "./login.css";

export const LoginSection = () => {
    const { email, setEmail, password, setPassword, error, loading, handleLogin } =
        useLogin();

    const [isSignUpMode, setIsSignUpMode] = useState(false);

    // Sign-up form state (placeholder — no backend yet)
    const [signUpName, setSignUpName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Connect to Firebase createUserWithEmailAndPassword
        console.log("Sign up submitted:", { signUpName, signUpEmail });
    };

    return (
        <div className={`auth-container${isSignUpMode ? " sign-up-mode" : ""}`}>
            <div className="forms-container">
                <div className="signin-signup">
                    {/* ===== SIGN IN FORM ===== */}
                    <form className="sign-in-form" onSubmit={handleLogin}>
                        <h2 className="auth-title">Sign In</h2>
                        <p className="auth-subtitle">Welcome back to Bumi Anyom</p>

                        {error && <div className="auth-error">{error}</div>}

                        <div className="input-field">
                            <span className="input-icon">
                                <Mail size={20} />
                            </span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="input-field">
                            <span className="input-icon">
                                <Lock size={20} />
                            </span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="auth-btn solid" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* ===== SIGN UP FORM ===== */}
                    <form className="sign-up-form" onSubmit={handleSignUp}>
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-subtitle">Join the Bumi Anyom family</p>

                        <div className="input-field">
                            <span className="input-icon">
                                <User size={20} />
                            </span>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={signUpName}
                                onChange={(e) => setSignUpName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <span className="input-icon">
                                <Mail size={20} />
                            </span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={signUpEmail}
                                onChange={(e) => setSignUpEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <span className="input-icon">
                                <Lock size={20} />
                            </span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={signUpPassword}
                                onChange={(e) => setSignUpPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-btn solid">
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>

            {/* ===== SLIDING PANELS ===== */}
            <div className="panels-container">
                <div className="panel left-panel">
                    <div className="panel-content">
                        <h3>New Here?</h3>
                        <p>
                            Create an account and start managing your Bumi Anyom properties
                            with ease.
                        </p>
                        <button
                            className="auth-btn transparent"
                            id="sign-up-btn"
                            type="button"
                            onClick={() => setIsSignUpMode(true)}
                        >
                            Sign Up
                        </button>
                    </div>
                    <img
                        src="https://i.ibb.co/6HXL6q1/Privacy-policy-rafiki.png"
                        className="panel-image"
                        alt="Sign up illustration"
                    />
                </div>
                <div className="panel right-panel">
                    <div className="panel-content">
                        <h3>Already Have an Account?</h3>
                        <p>
                            Sign in to access your dashboard and manage your hospitality
                            business.
                        </p>
                        <button
                            className="auth-btn transparent"
                            id="sign-in-btn"
                            type="button"
                            onClick={() => setIsSignUpMode(false)}
                        >
                            Sign In
                        </button>
                    </div>
                    <img
                        src="https://i.ibb.co/nP8H853/Mobile-login-rafiki.png"
                        className="panel-image"
                        alt="Sign in illustration"
                    />
                </div>
            </div>
        </div>
    );
};
