export default function LandingPage() {
  const openRegister = () => {
    window.location.href = "/register";
  };

  const openSignIn = () => {
    window.location.href = "/signin";
  };

  const socialApps = [
    { name: "Instagram", icon: "◎", color: "#E1306C" },
    { name: "Facebook", icon: "f", color: "#1877F2" },
    { name: "X", icon: "𝕏", color: "#111827" },
    { name: "LinkedIn", icon: "in", color: "#0A66C2" },
    { name: "YouTube", icon: "▶", color: "#FF0000" },
  ];

  const features = [
    {
      icon: "📅",
      title: "Smart Scheduling",
      text: "Schedule posts across all your social media platforms and save valuable time.",
    },
    {
      icon: "📊",
      title: "Powerful Analytics",
      text: "Track engagement, followers, reach and understand what works best.",
    },
    {
      icon: "🤖",
      title: "AI Insights",
      text: "Get intelligent recommendations and improve your social media strategy.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        color: "#172033",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          height: "76px",
          borderBottom: "1px solid #eef2f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6%",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            fontSize: "22px",
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "11px",
              background:
                "linear-gradient(135deg, #6d4aff 0%, #2563eb 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
            }}
          >
            ⚡
          </div>

          SocialPilot
        </div>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
          }}
        >
          <a
            href="#features"
            style={{
              textDecoration: "none",
              color: "#475569",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            Features
          </a>

          <a
            href="#pricing"
            style={{
              textDecoration: "none",
              color: "#475569",
              fontSize: "15px",
              fontWeight: 500,
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
              fontSize: "15px",
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
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(37,99,235,0.20)",
            }}
          >
            Start free trial
          </button>
        </nav>
      </header>

      <main>

        {/* HERO */}
        <section
          style={{
            padding: "80px 6% 35px",
            background:
              "radial-gradient(circle at 78% 35%, rgba(219,234,254,0.45), transparent 30%), #ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "65px",
              alignItems: "center",
            }}
          >
            {/* LEFT */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "#e0f2fe",
                  color: "#075985",
                  borderRadius: "30px",
                  padding: "9px 15px",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "24px",
                }}
              >
                ⭐ AI-Powered Social Media Management
              </div>

              <h1
                style={{
                  fontSize: "58px",
                  lineHeight: 1.04,
                  letterSpacing: "-2px",
                  margin: 0,
                  fontWeight: 800,
                  maxWidth: "650px",
                }}
              >
                Manage all your{" "}
                <span
                  style={{
                    color: "#1683d8",
                  }}
                >
                  social media
                </span>{" "}
                in one place
              </h1>

              <p
                style={{
                  fontSize: "18px",
                  lineHeight: 1.65,
                  color: "#64748b",
                  maxWidth: "610px",
                  marginTop: "25px",
                }}
              >
                Schedule posts, track campaigns, and analyze performance
                across every platform. Save hours every week and grow your
                audience faster.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "28px",
                }}
              >
                <button
                  type="button"
                  onClick={openRegister}
                  style={{
                    border: "none",
                    borderRadius: "10px",
                    background: "#1683d8",
                    color: "#ffffff",
                    padding: "15px 25px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 10px 25px rgba(22,131,216,0.22)",
                  }}
                >
                  → Start free trial
                </button>

                <button
                  type="button"
                  onClick={openSignIn}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#172033",
                    padding: "15px 10px",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  View demo dashboard
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "23px",
                }}
              >
                <span
                  style={{
                    color: "#d4a72c",
                    letterSpacing: "2px",
                    fontSize: "16px",
                  }}
                >
                  ★★★★★
                </span>

                <span
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Loved by 50,000+ marketers
                </span>
              </div>
            </div>

            {/* RIGHT DASHBOARD */}
            <div
              style={{
                position: "relative",
              }}
            >
              {/* SOCIAL APP ICONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                {socialApps.map((app) => (
                  <div
                    key={app.name}
                    title={app.name}
                    style={{
                      width: "39px",
                      height: "39px",
                      borderRadius: "11px",
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: app.color,
                      fontWeight: 800,
                      fontSize: app.name === "LinkedIn" ? "13px" : "18px",
                      boxShadow: "0 7px 18px rgba(15,23,42,0.08)",
                    }}
                  >
                    {app.icon}
                  </div>
                ))}
              </div>

              {/* DASHBOARD CARD */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  padding: "25px",
                  boxShadow:
                    "0 25px 60px rgba(15,23,42,0.13)",
                }}
              >

                {/* TOP BAR */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: "#ef4444",
                      }}
                    />

                    <span
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: "#f59e0b",
                      }}
                    />

                    <span
                      style={{
                        width: "11px",
                        height: "11px",
                        borderRadius: "50%",
                        background: "#22c55e",
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#16a34a",
                      fontWeight: 700,
                      background: "#dcfce7",
                      padding: "5px 9px",
                      borderRadius: "20px",
                    }}
                  >
                    Live
                  </span>
                </div>

                <h3
                  style={{
                    margin: "0 0 20px",
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  Social Media Dashboard
                </h3>

                {/* METRICS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "15px",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                    
                      👥 Followers
                    </div>

                    <div
                      style={{
                        fontSize: "25px",
                        fontWeight: 800,
                        marginTop: "6px",
                      }}
                    >
                      83.6K
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "15px",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      📈 Engagement
                    </div>

                    <div
                      style={{
                        fontSize: "25px",
                        fontWeight: 800,
                        marginTop: "6px",
                      }}
                    >
                      9.2%
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "15px",
                    }}
                  >
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                    📅 Scheduled  
                    </div>

                    <div
                      style={{
                        fontSize: "25px",
                        fontWeight: 800,
                        marginTop: "6px",
                      }}
                    >
                      43
                    </div>
                  </div>
                </div>

                {/* CHART */}
                <div
                  style={{
                    marginTop: "25px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      marginBottom: "15px",
                    }}
                  >
                    Engagement Overview
                  </div>

                  <div
                    style={{
                      height: "150px",
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "8px",
                      padding: "0 4px",
                    }}
                  >
                    {[45, 65, 52, 82, 62, 90, 72, 100, 80, 108].map(
                      (height, index) => (
                        <div
                          key={index}
                          style={{
                            flex: 1,
                            height: `${height}px`,
                            borderRadius: "6px 6px 2px 2px",
                            background:
                              "linear-gradient(180deg, #4f8df7 0%, #2563eb 100%)",
                          }}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* DASHBOARD BOTTOM */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "18px",
                    paddingTop: "15px",
                    borderTop: "1px solid #eef2f7",
                    color: "#94a3b8",
                    fontSize: "11px",
                  }}
                >
                  <span>Today</span>
                  <span>7 Days</span>
                  <span>30 Days</span>
                  <span style={{ color: "#2563eb", fontWeight: 700 }}>
                    12 Months
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div
            style={{
              maxWidth: "1000px",
              margin: "55px auto 0",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "20px",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#6d4aff",
                }}
              >
                50K+
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                Active Users
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#6d4aff",
                }}
              >
                2M+
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                Posts Scheduled
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#6d4aff",
                }}
              >
                12K+
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                Campaigns Run
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#6d4aff",
                }}
              >
                99.9%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                Uptime
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          style={{
            background: "#f8fafc",
            padding: "80px 6%",
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
                fontWeight: 800,
              }}
            >
              Everything you need to grow
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "17px",
                marginTop: "14px",
              }}
            >
              Powerful tools to manage your social media from one place.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginTop: "45px",
              }}
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "30px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "35px" }}>{feature.icon}</div>

                  <h3
                    style={{
                      fontSize: "21px",
                      marginTop: "18px",
                      marginBottom: "10px",
                    }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    style={{
                      color: "#64748b",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section
          id="pricing"
          style={{
            padding: "80px 6%",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "40px",
              margin: 0,
              fontWeight: 800,
            }}
          >
            Simple pricing
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "17px",
              marginTop: "14px",
            }}
          >
            Start free and upgrade when your business grows.
          </p>

          <div
            style={{
              margin: "35px auto 0",
              padding: "35px",
              border: "1px solid #e2e8f0",
              borderRadius: "20px",
              maxWidth: "420px",
              boxShadow: "0 15px 35px rgba(15,23,42,0.06)",
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
                fontWeight: 800,
                marginTop: "15px",
              }}
            >
              $0
            </div>

            <p style={{ color: "#64748b" }}>
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
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Start free trial
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}