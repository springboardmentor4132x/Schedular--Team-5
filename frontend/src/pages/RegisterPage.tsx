
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Content Creator");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!agree) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    // Account creation successful
    setSuccessMessage("Account created successfully!");
  };

  const handleSuccessOk = () => {
    setSuccessMessage("");
    navigate("/login");
  };

  return (
    <div className="register-page">

      {/* SUCCESS POPUP */}
      {successMessage && (
        <div className="success-overlay">
          <div className="success-popup">
            <div className="success-icon">✓</div>

            <h2>Success!</h2>

            <p>{successMessage}</p>

            <button
              type="button"
              className="success-button"
              onClick={handleSuccessOk}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* LEFT SIDE */}
      <div className="register-left">

        <div className="brand">
          <div className="brand-icon">⚡</div>
          <span>SocialPilot</span>
        </div>

        <div className="form-container">

          <h1>Create your account</h1>

          <p className="subtitle">
            Create your SocialPilot account and start managing your social media.
          </p>

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            <div className="field">
              <label>Full name</label>

              <div className="input-box">
                <span>♙</span>

                <input
                  type="text"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* USERNAME */}
            <div className="field">
              <label>Username</label>

              <div className="input-box">
                <span>♙</span>

                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="field">
              <label>Email address</label>

              <div className="input-box">
                <span>✉</span>

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* ROLE */}
            <div className="field">
              <label>Select account role</label>

              <select
                className="select-box"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Content Creator</option>
                <option>Social Media Manager</option>
                <option>Marketing Manager</option>
                <option>Business Owner</option>
                <option>Agency</option>
              </select>
            </div>

            {/* PASSWORD */}
            <div className="field">
              <label>Password</label>

              <div className="input-box">
                <span>🔒</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="show-button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="strength">
                <span
                  className={password.length >= 1 ? "active" : ""}
                />
                <span
                  className={password.length >= 6 ? "active" : ""}
                />
                <span
                  className={password.length >= 8 ? "active" : ""}
                />
                <span
                  className={password.length >= 10 ? "active" : ""}
                />

                <small>
                  {password.length >= 10
                    ? "Strong"
                    : password.length >= 6
                    ? "Fair"
                    : "Weak"}
                </small>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="field">
              <label>Confirm password</label>

              <div className="input-box">
                <span>🔒</span>

                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="show-button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* TERMS */}
            <div className="terms">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />

              <span>
                I agree to{" "}
                <a href="#terms">Terms of Service</a> and{" "}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </div>

            {/* CREATE ACCOUNT */}
            <button
              type="submit"
              className="create-button"
            >
              → Create account
            </button>

          </form>

          <div className="signin-text">
            Already have an account?{" "}
            <button
              type="button"
              className="signin-link"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">

        <div className="right-content">

          <div className="badge">
            ✦ Join 50,000+ marketers
          </div>

          <h2>
            The smartest way to
            <br />
            manage your social
            <br />
            media
          </h2>

          <p>
            Schedule posts, track campaigns, and grow your
            audience across every platform — all from one
            beautiful dashboard.
          </p>

          <div className="feature">
            <span>✓</span>
            Schedule to 6+ social platforms at once
          </div>

          <div className="feature">
            <span>✓</span>
            AI-powered optimal posting times
          </div>

          <div className="feature">
            <span>✓</span>
            Real-time analytics and insights
          </div>

          <div className="feature">
            <span>✓</span>
            Team collaboration built-in
          </div>

          <div className="review">

            <div className="avatars">
              <span>👩</span>
              <span>👨</span>
              <span>👩</span>
              <span>👨</span>
            </div>

            <div>
              <div className="stars">★★★★★</div>
              <small>4.9/5 from 2,500+ reviews</small>
            </div>

          </div>

        </div>
      </div>

      {/* CSS */}
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
        }

        .register-page {
          min-height: 100vh;
          display: flex;
          background: #f7f8fb;
        }

        /* LEFT */

        .register-left {
          width: 50%;
          min-height: 100vh;
          background: #ffffff;
          padding: 42px 7%;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 45px;
        }

        .brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: #5b46df;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .brand span {
          font-size: 20px;
          font-weight: 700;
          color: #191b25;
        }

        .form-container {
          width: 100%;
          max-width: 560px;
        }

        h1 {
          margin: 0;
          color: #171a25;
          font-size: 34px;
          line-height: 1.2;
        }

        .subtitle {
          color: #7d828f;
          font-size: 14px;
          line-height: 1.6;
          margin: 10px 0 28px;
        }

        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          color: #30333d;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 7px;
        }

        .input-box {
          width: 100%;
          height: 46px;
          border: 1px solid #dfe1e7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          background: white;
        }

        .input-box:focus-within {
          border-color: #5946df;
          box-shadow: 0 0 0 3px rgba(89, 70, 223, 0.08);
        }

        .input-box > span {
          margin-left: 13px;
          color: #999fa9;
        }

        .input-box input {
          flex: 1;
          height: 100%;
          border: none;
          outline: none;
          padding: 0 12px;
          font-size: 14px;
          background: transparent;
        }

        .select-box {
          width: 100%;
          height: 46px;
          border: 1px solid #dfe1e7;
          border-radius: 8px;
          padding: 0 13px;
          outline: none;
          background: white;
          color: #333740;
          font-size: 14px;
        }

        .select-box:focus {
          border-color: #5946df;
        }

        .show-button {
          border: none;
          background: transparent;
          color: #777d88;
          cursor: pointer;
          font-size: 11px;
          padding: 0 13px;
        }

        .show-button:hover {
          color: #5946df;
        }

        .strength {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 6px;
        }

        .strength span {
          height: 4px;
          flex: 1;
          background: #e4e5e8;
          border-radius: 4px;
        }

        .strength span.active {
          background: #e4b92d;
        }

        .strength small {
          color: #8a8e98;
          font-size: 11px;
          width: 35px;
          text-align: right;
        }

        .terms {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 18px 0;
          color: #7b808b;
          font-size: 12px;
          line-height: 1.5;
        }

        .terms input {
          margin-top: 2px;
          accent-color: #5845df;
        }

        .terms a {
          color: #5141c8;
          text-decoration: none;
          font-weight: 600;
        }

        .create-button {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 8px;
          background: #5946df;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .create-button:hover {
          background: #4936cf;
        }

        .signin-text {
          text-align: center;
          margin-top: 18px;
          color: #858a94;
          font-size: 13px;
        }

        .signin-link {
          border: none;
          background: transparent;
          color: #5040c7;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          padding: 0;
        }

        /* RIGHT */

        .register-right {
          width: 50%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 60px 7%;
          color: white;
          background: linear-gradient(
            135deg,
            #5b39df,
            #713be8,
            #8b38e8
          );
        }

        .right-content {
          max-width: 550px;
        }

        .badge {
          display: inline-block;
          padding: 8px 13px;
          border-radius: 20px;
          background: rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.9);
          font-size: 11px;
          margin-bottom: 25px;
        }

        .right-content h2 {
          margin: 0;
          font-size: 46px;
          line-height: 1.08;
          letter-spacing: -1px;
        }

        .right-content p {
          max-width: 500px;
          margin: 22px 0 30px;
          color: rgba(255,255,255,0.82);
          font-size: 15px;
          line-height: 1.7;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 14px 0;
          color: rgba(255,255,255,0.92);
          font-size: 13px;
        }

        .feature span {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.14);
          font-size: 11px;
        }

        .review {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 34px;
        }

        .avatars {
          display: flex;
        }

        .avatars span {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: -6px;
          border: 2px solid rgba(255,255,255,0.8);
        }

        .avatars span:first-child {
          margin-left: 0;
        }

        .stars {
          color: #ffd45c;
          letter-spacing: 2px;
          font-size: 13px;
        }

        .review small {
          color: rgba(255,255,255,0.75);
          font-size: 11px;
        }

        /* SUCCESS POPUP */

        .success-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .success-popup {
          width: 100%;
          max-width: 390px;
          background: white;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .success-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: #e8f7ee;
          color: #21864b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: bold;
        }

        .success-popup h2 {
          margin: 0 0 8px;
          color: #171a25;
          font-size: 24px;
        }

        .success-popup p {
          margin: 0 0 24px;
          color: #666b76;
          font-size: 14px;
        }

        .success-button {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 8px;
          background: #5946df;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .success-button:hover {
          background: #4936cf;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .register-page {
            flex-direction: column;
          }

          .register-left,
          .register-right {
            width: 100%;
          }

          .register-right {
            min-height: 500px;
          }

          .right-content h2 {
            font-size: 38px;
          }
        }

        @media (max-width: 600px) {
          .register-left {
            padding: 30px 20px;
          }

          .register-right {
            padding: 50px 20px;
          }

          h1 {
            font-size: 28px;
          }

          .right-content h2 {
            font-size: 32px;
          }
        }
      `}</style>

    </div>
  );
};

export default RegisterPage;