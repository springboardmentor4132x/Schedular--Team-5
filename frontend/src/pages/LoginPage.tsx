import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    navigate("/app/dashboard");
  };

  const goRegister = () => {
    navigate("/register");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "50%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: "430px" }}>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "55px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "21px",
              }}
            >
              ⚡
            </div>

            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              SocialPilot
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Welcome back
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#6b7280",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Sign in to your account to continue managing
            your social media.
          </p>

          <form onSubmit={handleLogin}>

            <label
              style={{
                display: "block",
                marginTop: "30px",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                outline: "none",
                fontSize: "14px",
              }}
            />

            <label
              style={{
                display: "block",
                marginTop: "20px",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
                outline: "none",
                fontSize: "14px",
              }}
            />
          <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "15px",
                fontSize: "14px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  color: "#4b5563",
                }}
              >
                <input type="checkbox" />
                Remember me
              </label>

              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#4f46e5",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "15px",
                border: "none",
                borderRadius: "9px",
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign in →
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "28px 0 20px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "#e5e7eb",
                }}
              />

              <span
                style={{
                  padding: "0 14px",
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                OR CONTINUE WITH
              </span>

              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: "#e5e7eb",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <button
                type="button"
                style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "9px",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                GitHub
              </button>

              <button
                type="button"
                style={{
                  padding: "12px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "9px",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Facebook
              </button>
            </div>

            <p
              style={{
                textAlign: "center",
                marginTop: "25px",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Don't have an account?{" "}
              <button
                type="button"
                onClick={goRegister}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#4f46e5",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Sign up free
              </button>
            </p>

          </form>
        </div>
      </div>
      <div
        style={{
          width: "50%",
          minHeight: "100vh",
          background: "linear-gradient(135deg,#4f46e5,#7c3aed,#6d28d9)",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          padding: "60px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: "540px" }}>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 15px",
              borderRadius: "30px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: "13px",
              marginBottom: "25px",
            }}
          >
            <span style={{ color: "#34d399" }}>●</span>
            Join 50,000+ marketers
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "46px",
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            The smartest way to manage your social media
          </h2>

          <p
            style={{
              marginTop: "25px",
              fontSize: "18px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Schedule posts, track campaigns, and grow your
            audience across every platform — all from one
            beautiful dashboard.
          </p>

          <div
            style={{
              marginTop: "35px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              fontSize: "15px",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            <div>✓ Schedule to 6+ social platforms at once</div>
            <div>✓ AI-powered optimal posting times</div>
            <div>✓ Real-time analytics and reporting</div>
            <div>✓ Team collaboration built-in</div>
          </div>

          <div
            style={{
              marginTop: "45px",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#fca5a5",
                  border: "2px solid white",
                }}
              />

              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#93c5fd",
                  border: "2px solid white",
                  marginLeft: "-10px",
                }}
              />

              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#86efac",
                  border: "2px solid white",
                  marginLeft: "-10px",
                }}
              />
            </div>

            <div>
              <div
                style={{
                  color: "#fbbf24",
                  fontSize: "16px",
                }}
              >
                ★★★★★
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                4.9/5 from 2,500+ reviews
              </div>
            </div>
          </div>
       </div>
      </div>
    </div>
  );
}

export default LoginPage;     