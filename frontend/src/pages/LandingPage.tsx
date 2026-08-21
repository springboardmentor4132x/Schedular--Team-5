<<<<<<< HEAD
export default function LandingPage() {
  const openRegister = () => {
    window.location.href = "/register";
  };

  const openSignIn = () => {
    window.location.href = "/signin";
  };

  const openDemoDashboard = () => {
  window.location.href = "/app/dashboard";
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
                  onClick={() => {
  window.location.href = "/app/dashboard";
}}
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
=======
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Calendar, BarChart3, Megaphone, Share2, Bell, Check,
  ArrowRight, Star, Twitter, Linkedin, Facebook, Instagram,
  Sparkles, Shield, Clock, Users, TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui';

const features = [
  { icon: Calendar, title: 'Smart Scheduling', description: 'Schedule posts across all platforms with AI-powered optimal timing recommendations.', color: 'from-blue-500 to-cyan-500' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Track engagement, reach, and conversions with beautiful, real-time dashboards.', color: 'from-violet-500 to-purple-500' },
  { icon: Megaphone, title: 'Campaign Management', description: 'Create, manage, and track marketing campaigns from a single unified workspace.', color: 'from-amber-500 to-orange-500' },
  { icon: Share2, title: 'Multi-Platform', description: 'Connect and manage Facebook, Instagram, Twitter, LinkedIn, and YouTube accounts.', color: 'from-emerald-500 to-teal-500' },
  { icon: Bell, title: 'Smart Notifications', description: 'Never miss a beat with intelligent alerts for posts, campaigns, and milestones.', color: 'from-rose-500 to-pink-500' },
  { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption and SOC 2 compliance to keep your data safe and secure.', color: 'from-indigo-500 to-blue-500' },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Posts Scheduled' },
  { value: '12K+', label: 'Campaigns Run' },
  { value: '99.9%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Sarah Mitchell', role: 'CMO, TechCorp', avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'SocialPilot transformed our social media workflow. We save 15+ hours every week and our engagement has never been higher.', rating: 5 },
  { name: 'James Rodriguez', role: 'Founder, StartupHub', avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'The analytics dashboard is incredible. We can finally see which campaigns actually drive revenue. Game changer.', rating: 5 },
  { name: 'Priya Sharma', role: 'Social Media Manager', avatar: 'https://images.pexels.com/photos/3746314/pexels-photo-3746314.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Managing 6 social accounts used to be a nightmare. Now it takes me 30 minutes a day. The scheduling AI is brilliant.', rating: 5 },
  { name: 'Michael Chen', role: 'Marketing Director', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', content: 'Best social media tool we have used. The campaign tracking and ROI reporting features are exactly what we needed.', rating: 5 },
];

const pricingPlans = [
  { name: 'Starter', price: '$19', period: '/mo', features: ['3 social accounts', '100 scheduled posts', 'Basic analytics', 'Email support'], popular: false },
  { name: 'Professional', price: '$49', period: '/mo', features: ['10 social accounts', 'Unlimited posts', 'Advanced analytics', 'Campaign management', 'Priority support', 'Team collaboration'], popular: true },
  { name: 'Enterprise', price: '$99', period: '/mo', features: ['Unlimited accounts', 'Unlimited everything', 'Custom analytics', 'API access', 'Dedicated manager', 'SSO & SAML'], popular: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SocialPilot</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link to="/register"><Button size="sm" className="hidden sm:inline-flex">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700">AI-Powered Social Media Management</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight text-balance">
                Manage all your <span className="gradient-text">social media</span> in one place
              </motion.h1>

              <motion.p variants={itemVariants} className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
                Schedule posts, track campaigns, and analyze performance across every platform. Save hours every week and grow your audience faster.
              </motion.p>

              <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>Start free trial</Button>
                </Link>
                <Link to="/app/dashboard">
                  <Button variant="secondary" size="lg" icon={<BarChart3 className="w-5 h-5" />}>View demo dashboard</Button>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {['A', 'S', 'M', 'P'][i - 1]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Loved by 50,000+ marketers</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center text-xs text-gray-400 font-medium">socialpilot.io/dashboard</div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Followers', value: '83.6K', icon: Users, color: 'from-indigo-500 to-violet-500' },
                      { label: 'Engagement', value: '9.2%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
                      { label: 'Scheduled', value: '43', icon: Clock, color: 'from-amber-500 to-orange-500' },
                    ].map((stat) => (
                      <motion.div
                        key={stat.label}
                        whileHover={{ y: -2 }}
                        className="bg-gray-50 rounded-xl p-3"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-700">Engagement Overview</p>
                      <span className="text-xs text-emerald-600 font-medium">+12.5%</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-24">
                      {[40, 55, 45, 70, 60, 85, 75, 95, 80, 100, 90, 110].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-indigo-500 to-violet-400 rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                      <div key={i} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-sm font-semibold text-indigo-600">FEATURES</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-gray-600">
              Powerful tools designed to streamline your social media management and drive real results.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow hover:card-shadow-hover transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-sm font-semibold text-indigo-600">TESTIMONIALS</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Trusted by thousands of teams
            </h2>
            <p className="mt-4 text-gray-600">
              See what our customers have to say about their experience with SocialPilot.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 gap-6"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 card-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-sm font-semibold text-indigo-600">PRICING</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-gray-600">Choose the plan that works for you. No hidden fees.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-white rounded-2xl p-6 border ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200'} card-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <Link to="/register" className="block mt-5">
                  <Button fullWidth variant={plan.popular ? 'primary' : 'secondary'}>Get started</Button>
                </Link>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 px-8 py-16 text-center"
          >
            <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to transform your social media?
              </h2>
              <p className="mt-4 text-white/80 max-w-xl mx-auto">
                Join 50,000+ marketers who save hours every week with SocialPilot. Start your free 14-day trial today.
              </p>
              <Link to="/register" className="inline-block mt-8">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 hover:shadow-xl" icon={<ArrowRight className="w-5 h-5" />}>
                  Start your free trial
                </Button>
              </Link>
              <p className="mt-4 text-xs text-white/70">No credit card required</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" fill="white" />
                </div>
                <span className="text-base font-bold text-gray-900">SocialPilot</span>
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                The all-in-one social media management platform for modern marketing teams.
              </p>
              <div className="flex gap-3 mt-4">
                {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API Docs', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact', 'Press'] },
              { title: 'Resources', links: ['Help Center', 'Community', 'Tutorials', 'Status', 'Security'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2026 SocialPilot, Inc. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
>>>>>>> origin/shravanik-latest-scheduler
