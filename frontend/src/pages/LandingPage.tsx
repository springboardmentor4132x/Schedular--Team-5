export default function LandingPage() {
  const openRegister = () => {
    window.location.href = "/register";
  };

  const openSignIn = () => {
    window.location.href = "/signin";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#172033",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          height: "76px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 7%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⚡
          </div>

          SocialPilot
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
        >
          <a
            href="#features"
            style={{
              textDecoration: "none",
              color: "#475569",
            }}
          >
            Features
          </a>

          <a
            href="#pricing"
            style={{
              textDecoration: "none",
              color: "#475569",
            }}
          >
            Pricing
          </a>

          <button
            type="button"
            onClick={openSignIn}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              color: "#172033",
            }}
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={openRegister}
            style={{
              border: "none",
              borderRadius: "9px",
              background: "#2563eb",
              color: "#ffffff",
              padding: "13px 22px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Start free trial
          </button>
        </div>
      </header>

      <main>
        <section
          style={{
            padding: "90px 7% 70px",
          }}
        >
          <div
            style={{
              maxWidth: "1150px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "#dbeafe",
                color: "#075985",
                borderRadius: "30px",
                padding: "10px 18px",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              ⭐ AI-Powered Social Media Management
            </div>

            <h1
              style={{
                fontSize: "64px",
                lineHeight: 1.08,
                margin: "30px 0 20px",
                maxWidth: "900px",
                fontWeight: 700,
              }}
            >
              Manage all your{" "}
              <span style={{ color: "#1677d2" }}>
                social media
              </span>{" "}
              in one place
            </h1>

            <p
              style={{
                fontSize: "20px",
                lineHeight: 1.6,
                color: "#64748b",
                maxWidth: "850px",
                margin: 0,
              }}
            >
              Schedule posts, track campaigns, and analyze
              performance across every platform. Save hours
              every week and grow your audience faster.
            </p>

            <div
              style={{
                display: "flex",
                gap: "15px",
                marginTop: "30px",
              }}
            >
              <button
                type="button"
                onClick={openRegister}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  background: "#1677d2",
                  color: "#ffffff",
                  padding: "16px 28px",
                  fontSize: "17px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                → Start free trial
              </button>

              <button
                type="button"
                onClick={openSignIn}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#172033",
                  padding: "16px 30px",
                  fontSize: "17px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "28px",
              }}
            >
              <span
                style={{
                  color: "#d19a25",
                  fontSize: "22px",
                }}
              >
                ★★★★★
              </span>

              <span style={{ color: "#64748b" }}>
                Loved by 50,000+ marketers
              </span>
            </div>

            <div
              style={{
                marginTop: "70px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "24px",
                padding: "28px",
                boxShadow:
                  "0 15px 40px rgba(15,23,42,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "7px",
                  marginBottom: "25px",
                }}
              >
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#ef4444",
                  }}
                />

                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#f59e0b",
                  }}
                />

                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "15px",
                    padding: "25px",
                  }}
                >
                  <div style={{ color: "#64748b" }}>
                    Followers
                  </div>

                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: 700,
                      marginTop: "10px",
                    }}
                  >
                    128.4K
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "15px",
                    padding: "25px",
                  }}
                >
                  <div style={{ color: "#64748b" }}>
                    Engagement
                  </div>

                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: 700,
                      marginTop: "10px",
                    }}
                  >
                    24.8%
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "15px",
                    padding: "25px",
                  }}
                >
                  <div style={{ color: "#64748b" }}>
                    Scheduled
                  </div>

                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: 700,
                      marginTop: "10px",
                    }}
                  >
                    342
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          style={{
            background: "#f8fafc",
            padding: "80px 7%",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "40px",
                margin: 0,
              }}
            >
              Everything you need to grow
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                marginTop: "15px",
              }}
            >
              Powerful tools to manage your social
              media from one place.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "20px",
                marginTop: "45px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "30px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "35px" }}>
                  📅
                </div>

                <h3
                  style={{
                    fontSize: "22px",
                    marginTop: "18px",
                  }}
                >
                  Smart Scheduling
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Schedule posts across all your social
                  media platforms and save valuable time.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "30px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "35px" }}>
                  📊
                </div>

                <h3
                  style={{
                    fontSize: "22px",
                    marginTop: "18px",
                  }}
                >
                  Powerful Analytics
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Track engagement, followers, reach and
                  understand what works best.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "30px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "35px" }}>
                  🤖
                </div>

                <h3
                  style={{
                    fontSize: "22px",
                    marginTop: "18px",
                  }}
                >
                  AI Insights
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Get intelligent recommendations and
                  improve your social media strategy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          style={{
            padding: "80px 7%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "40px",
                margin: 0,
              }}
            >
              Simple pricing
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                marginTop: "15px",
              }}
            >
              Start free and upgrade when your business
              grows.
            </p>

            <div
              style={{
                marginTop: "35px",
                padding: "35px",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                maxWidth: "420px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  margin: 0,
                }}
              >
                Free Trial
              </h3>

              <div
                style={{
                  fontSize: "45px",
                  fontWeight: 700,
                  marginTop: "15px",
                }}
              >
                $0
              </div>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Try SocialPilot before you commit.
              </p>

              <button
                type="button"
                onClick={openRegister}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "15px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Start free trial
              </button>
            </div>
          </div>
        </section>

  <section
          id="features"
          style={{
            background: "#f8fafc",
            padding: "80px 7%",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "40px",
                margin: 0,
              }}
            >
              Everything you need to grow
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                marginTop: "15px",
              }}
            >
              Powerful tools to manage your social
              media from one place.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginTop: "45px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "30px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "35px" }}>📅</div>

                <h3
                  style={{
                    fontSize: "22px",
                    marginTop: "18px",
                  }}
                >
                  Smart Scheduling
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Schedule posts across all your social
                  media platforms and save valuable time.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "30px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "35px" }}>📊</div>

                <h3
                  style={{
                    fontSize: "22px",
                    marginTop: "18px",
                  }}
                >
                  Powerful Analytics
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Track engagement, followers, reach and
                  understand what works best.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "30px",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "35px" }}>🤖</div>

                <h3
                  style={{
                    fontSize: "22px",
                    marginTop: "18px",
                  }}
                >
                  AI Insights
                </h3>

                <p
                  style={{
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Get intelligent recommendations and
                  improve your social media strategy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          style={{
            padding: "80px 7%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "40px",
                margin: 0,
              }}
            >
              Simple pricing
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "18px",
                marginTop: "15px",
              }}
            >
              Start free and upgrade when your business
              grows.
            </p>

            <div
              style={{
                marginTop: "35px",
                padding: "35px",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                maxWidth: "420px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  margin: 0,
                }}
              >
                Free Trial
              </h3>

              <div
                style={{
                  fontSize: "45px",
                  fontWeight: 700,
                  marginTop: "15px",
                }}
              >
                $0
              </div>

              <p
                style={{
                  color: "#64748b",
                }}
              >
                Try SocialPilot before you commit.
              </p>

              <button
                type="button"
                onClick={openRegister}
                style={{
                  width: "100%",
                  marginTop: "20px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "15px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Start free trial
              </button>
            </div>
          </div>
        </section>
      <section
          style={{
            background: "#172033",
            color: "#ffffff",
            padding: "70px 7%",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "38px",
              margin: 0,
            }}
          >
            Ready to grow your social media?
          </h2>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "18px",
              marginTop: "15px",
            }}
          >
            Join thousands of marketers using SocialPilot.
          </p>

          <button
            type="button"
            onClick={openRegister}
            style={{
              marginTop: "25px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              padding: "15px 30px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Get started
          </button>
        </section>
      </main>

      <footer
        style={{
          background: "#0f172a",
          color: "#94a3b8",
          padding: "25px 7%",
          textAlign: "center",
        }}
      >
        © 2026 SocialPilot. All rights reserved.
      </footer>
    </div>
  );
}