import React, { useMemo, useState } from "react";
import {
  Plus,
  Megaphone,
  Calendar,
  DollarSign,
  Target,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  Search,
} from "lucide-react";

type CampaignStatus = "active" | "draft" | "completed" | "paused";

type Campaign = {
  id: number;
  name: string;
  description: string;
  platforms: string[];
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
  posts: number;
  reach: number;
  engagement: number;
  objective: string;
  color: string;
};

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Product Launch",
    description:
      "Promote the new summer collection across social media platforms.",
    platforms: ["Instagram", "Facebook"],
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    budget: 10000,
    spent: 4200,
    status: "active",
    posts: 12,
    reach: 24500,
    engagement: 8.4,
    objective: "Brand Awareness",
    color: "#2563eb",
  },
  {
    id: 2,
    name: "Brand Awareness",
    description:
      "Build stronger brand recognition through consistent social content.",
    platforms: ["Instagram", "LinkedIn"],
    startDate: "2026-08-05",
    endDate: "2026-09-05",
    budget: 7500,
    spent: 2800,
    status: "active",
    posts: 8,
    reach: 18700,
    engagement: 7.2,
    objective: "Brand Awareness",
    color: "#7c3aed",
  },
  {
    id: 3,
    name: "Social Promotion",
    description:
      "Drive traffic and engagement using promotional social media posts.",
    platforms: ["Facebook", "X"],
    startDate: "2026-07-10",
    endDate: "2026-08-20",
    budget: 5000,
    spent: 5000,
    status: "completed",
    posts: 15,
    reach: 31200,
    engagement: 9.1,
    objective: "Engagement",
    color: "#db2777",
  },
  {
    id: 4,
    name: "Content Campaign",
    description:
      "Share useful educational content and customer success stories.",
    platforms: ["LinkedIn", "Instagram"],
    startDate: "2026-08-10",
    endDate: "2026-09-10",
    budget: 6500,
    spent: 1200,
    status: "draft",
    posts: 4,
    reach: 8600,
    engagement: 5.8,
    objective: "Trust Building",
    color: "#059669",
  },
];

const statusStyles: Record<
  CampaignStatus,
  {
    background: string;
    color: string;
    border: string;
  }
> = {
  active: {
    background: "#ecfdf5",
    color: "#047857",
    border: "#a7f3d0",
  },
  draft: {
    background: "#f1f5f9",
    color: "#475569",
    border: "#cbd5e1",
  },
  completed: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
  },
  paused: {
    background: "#fff7ed",
    color: "#c2410c",
    border: "#fed7aa",
  },
};

const platformColors: Record<string, string> = {
  Instagram: "#e1306c",
  Facebook: "#1877f2",
  LinkedIn: "#0a66c2",
  X: "#111827",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string): string {
  const date = new Date(value + "T00:00:00");

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CampaignsPage() {
  const [campaigns, setCampaigns] =
    useState<Campaign[]>(initialCampaigns);

  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState<Campaign | null>(null);
  const [showEdit, setShowEdit] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<Campaign | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    objective: "Brand Awareness",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCampaigns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const statusMatch =
        filter === "all" || campaign.status === filter;

      const searchMatch =
        !term ||
        campaign.name.toLowerCase().includes(term) ||
        campaign.description.toLowerCase().includes(term) ||
        campaign.objective.toLowerCase().includes(term);

      return statusMatch && searchMatch;
    });
  }, [campaigns, filter, searchTerm]);

  const totalBudget = campaigns.reduce(
    (sum, campaign) => sum + campaign.budget,
    0
  );

  const totalSpent = campaigns.reduce(
    (sum, campaign) => sum + campaign.spent,
    0
  );

  const totalReach = campaigns.reduce(
    (sum, campaign) => sum + campaign.reach,
    0
  );

  const activeCount = campaigns.filter(
    (campaign) => campaign.status === "active"
  ).length;

  const completedCount = campaigns.filter(
    (campaign) => campaign.status === "completed"
  ).length;

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      budget: "",
      startDate: "",
      endDate: "",
      objective: "Brand Awareness",
    });

    setErrors({});
  };

  const handleCreate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Campaign name is required";
    }

    if (!form.budget || Number(form.budget) <= 0) {
      nextErrors.budget = "Enter a valid budget";
    }

    if (!form.startDate) {
      nextErrors.startDate = "Start date is required";
    }

    if (!form.endDate) {
      nextErrors.endDate = "End date is required";
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    ) {
      nextErrors.endDate = "End date must be after start date";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now(),
      name: form.name.trim(),
      description:
        form.description.trim() || "No description provided.",
      platforms: ["Instagram", "Facebook"],
      startDate: form.startDate,
      endDate: form.endDate,
      budget: Number(form.budget),
      spent: 0,
      status: "active",
      posts: 0,
      reach: 0,
      engagement: 0,
      objective: form.objective,
      color: "#2563eb",
    };

    setCampaigns((current) => [newCampaign, ...current]);
    setShowCreate(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setCampaigns((current) =>
      current.filter((campaign) => campaign.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
    setMenuOpen(null);
  };

  const handleEditSave = () => {
    if (!showEdit) {
      return;
    }

    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === showEdit.id ? showEdit : campaign
      )
    );

    setShowEdit(null);
  };

  const filters = [
    {
      key: "all" as const,
      label: "All Campaigns",
      count: campaigns.length,
    },
    {
      key: "active" as const,
      label: "Active",
      count: campaigns.filter((c) => c.status === "active").length,
    },
    {
      key: "draft" as const,
      label: "Drafts",
      count: campaigns.filter((c) => c.status === "draft").length,
    },
    {
      key: "completed" as const,
      label: "Completed",
      count: campaigns.filter((c) => c.status === "completed").length,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Campaigns
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Create and manage your marketing campaigns.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: 10,
              padding: "11px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.18)",
            }}
          >
            <Plus size={16} />
            New Campaign
          </button>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          {[
            {
              label: "Total Campaigns",
              value: campaigns.length,
              icon: <Megaphone size={19} />,
              color: "#2563eb",
            },
            {
              label: "Active Now",
              value: activeCount,
              icon: <Target size={19} />,
              color: "#059669",
            },
            {
              label: "Total Budget",
              value: formatCurrency(totalBudget),
              icon: <DollarSign size={19} />,
              color: "#d97706",
            },
            {
              label: "Total Reach",
              value: formatNumber(totalReach),
              icon: <Users size={19} />,
              color: "#0891b2",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#ffffff",
                border: "1px solid #dbeafe",
                borderRadius: 14,
                padding: 18,
                boxShadow:
                  "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: stat.color,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                {stat.icon}
              </div>

              <div
                style={{
                  fontSize: 21,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                {stat.value}
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {/* Search */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbeafe",
            borderRadius: 14,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: 420,
            }}
          >
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 13,
                top: 13,
                color: "#94a3b8",
              }}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search campaigns..."
              style={{
                width: "100%",
                height: 42,
                boxSizing: "border-box",
                padding: "0 14px 0 38px",
                border: "1px solid #bfdbfe",
                borderRadius: 10,
                outline: "none",
                color: "#334155",
                background: "#ffffff",
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 18,
          }}
        >
          {filters.map((item) => {
            const selected = filter === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: selected
                    ? "1px solid #2563eb"
                    : "1px solid #dbeafe",
                  background: selected
                    ? "#2563eb"
                    : "#ffffff",
                  color: selected
                    ? "#ffffff"
                    : "#475569",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {item.label}

                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: 6,
                    background: selected
                      ? "rgba(255,255,255,0.18)"
                      : "#eff6ff",
                    color: selected
                      ? "#ffffff"
                      : "#2563eb",
                    fontSize: 11,
                  }}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Performance */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #dbeafe",
            borderRadius: 14,
            padding: 18,
            marginBottom: 18,
            boxShadow:
              "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              color: "#0f172a",
              fontSize: 17,
              fontWeight: 800,
            }}
          >
            Campaign Performance
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 18,
            }}
          >
            <div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Total Reach
              </div>
              <div
                style={{
                  color: "#0f172a",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {formatNumber(totalReach)}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Budget Used
              </div>
              <div
                style={{
                  color: "#0f172a",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {formatCurrency(totalSpent)}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Running
              </div>
              <div
                style={{
                  color: "#047857",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {activeCount}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Completed
              </div>
              <div
                style={{
                  color: "#1d4ed8",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {completedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Grid */}
        {filteredCampaigns.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #dbeafe",
              borderRadius: 14,
              padding: "70px 20px",
              textAlign: "center",
            }}
          >
            <Megaphone
              size={42}
              style={{
                color: "#93c5fd",
                marginBottom: 12,
              }}
            />

            <h3
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: 17,
              }}
            >
              No campaigns found
            </h3>

            <p
              style={{
                margin: "7px 0 18px",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Try changing your search or create a new campaign.
            </p>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              style={{
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                borderRadius: 9,
                padding: "10px 15px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              New Campaign
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(290px, 1fr))",
              gap: 16,
            }}
          >
            {filteredCampaigns.map((campaign) => {
              const progress =
                campaign.budget > 0
                  ? Math.min(
                      (campaign.spent / campaign.budget) * 100,
                      100
                    )
                  : 0;

              const status = statusStyles[campaign.status];

              return (
                <div
                  key={campaign.id}
                  style={{
                    position: "relative",
                    background: "#ffffff",
                    border: "1px solid #dbeafe",
                    borderRadius: 14,
                    padding: 18,
                    boxShadow:
                      "0 2px 8px rgba(15,23,42,0.04)",
                  }}
                >
                  {/* Top */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: status.background,
                        color: status.color,
                        border: `1px solid ${status.border}`,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: status.color,
                        }}
                      />
                      {campaign.status}
                    </span>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpen(
                            menuOpen === campaign.id
                              ? null
                              : campaign.id
                          )
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#64748b",
                          cursor: "pointer",
                          padding: 5,
                        }}
                      >
                        <MoreVertical size={17} />
                      </button>

                      {menuOpen === campaign.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 32,
                            width: 150,
                            background: "#ffffff",
                            border: "1px solid #dbeafe",
                            borderRadius: 10,
                            boxShadow:
                              "0 10px 30px rgba(15,23,42,0.12)",
                            padding: 5,
                            zIndex: 20,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShowView(campaign);
                              setMenuOpen(null);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              border: "none",
                              background: "transparent",
                              padding: "9px 8px",
                              color: "#334155",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: 12,
                            }}
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowEdit({
                                ...campaign,
                              });
                              setMenuOpen(null);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              border: "none",
                              background: "transparent",
                              padding: "9px 8px",
                              color: "#334155",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: 12,
                            }}
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(campaign);
                              setMenuOpen(null);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              border: "none",
                              background: "transparent",
                              padding: "9px 8px",
                              color: "#dc2626",
                              cursor: "pointer",
                              textAlign: "left",
                              fontSize: 12,
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: campaign.color,
                      }}
                    />

                    <h3
                      style={{
                        margin: 0,
                        color: "#0f172a",
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                    >
                      {campaign.name}
                    </h3>
                  </div>

                  <p
                    style={{
                      margin: "0 0 14px",
                      color: "#64748b",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {campaign.description}
                  </p>

                  {/* Platforms */}
                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      marginBottom: 16,
                    }}
                  >
                    {campaign.platforms.map((platform) => (
                      <span
                        key={platform}
                        style={{
                          padding: "5px 8px",
                          borderRadius: 7,
                          background: "#eff6ff",
                          border: "1px solid #dbeafe",
                          color:
                            platformColors[platform] ||
                            "#2563eb",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, 1fr)",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                        }}
                      >
                        Reach
                      </div>

                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: 13,
                          fontWeight: 700,
                          marginTop: 3,
                        }}
                      >
                        {formatNumber(campaign.reach)}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                        }}
                      >
                        Engagement
                      </div>

                      <div
                        style={{
                          color: "#059669",
                          fontSize: 13,
                          fontWeight: 700,
                          marginTop: 3,
                        }}
                      >
                        {campaign.engagement}%
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                        }}
                      >
                        Posts
                      </div>

                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: 13,
                          fontWeight: 700,
                          marginTop: 3,
                        }}
                      >
                        {campaign.posts}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                        }}
                      >
                        Objective
                      </div>

                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: 13,
                          fontWeight: 700,
                          marginTop: 3,
                        }}
                      >
                        {campaign.objective}
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                        }}
                      >
                        Budget
                      </span>

                      <span
                        style={{
                          color: "#334155",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {formatCurrency(campaign.spent)} /{" "}
                        {formatCurrency(campaign.budget)}
                      </span>
                    </div>

                    <div
                      style={{
                        height: 7,
                        background: "#e2e8f0",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: campaign.color,
                          borderRadius: 999,
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        marginTop: 11,
                        paddingTop: 11,
                        borderTop: "1px solid #e2e8f0",
                        color: "#64748b",
                        fontSize: 10,
                      }}
                    >
                      <Calendar size={13} />

                      <span>
                        {formatDate(campaign.startDate)} -{" "}
                        {formatDate(campaign.endDate)}
                      </span>

                      <span
                        style={{
                          marginLeft: "auto",
                          color: campaign.color,
                          fontWeight: 800,
                        }}
                      >
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 600,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #dbeafe",
                boxShadow:
                  "0 20px 60px rgba(15,23,42,0.2)",
              }}
            >
              <div
                style={{
                  padding: 20,
                  borderBottom: "1px solid #dbeafe",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 18,
                      color: "#0f172a",
                    }}
                  >
                    Create New Campaign
                  </h2>

                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    Add campaign details below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
                  style={{
                    border: "none",
                    background: "#eff6ff",
                    color: "#2563eb",
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    cursor: "pointer",
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              <div
                style={{
                  padding: 20,
                  display: "grid",
                  gap: 15,
                }}
              >
                <label>
                  <span
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    Campaign Name
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Summer Launch 2026"
                    style={{
                      width: "100%",
                      height: 42,
                      boxSizing: "border-box",
                      padding: "0 12px",
                      border: "1px solid #bfdbfe",
                      borderRadius: 9,
                      outline: "none",
                      fontSize: 13,
                    }}
                  />

                  {errors.name && (
                    <span
                      style={{
                        display: "block",
                        marginTop: 5,
                        color: "#dc2626",
                        fontSize: 11,
                      }}
                    >
                      {errors.name}
                    </span>
                  )}
                </label>

                <label>
                  <span
                    style={{
                      display: "block",
                      marginBottom: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    Description
                  </span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe your campaign..."
                    rows={3}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: 12,
                      border: "1px solid #bfdbfe",
                      borderRadius: 9,
                      outline: "none",
                      resize: "vertical",
                      fontSize: 13,
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: 14,
                  }}
                >
                  <label>
                    <span
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      Budget ($)
                    </span>

                    <input
                      type="number"
                      value={form.budget}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          budget: event.target.value,
                        })
                      }
                      placeholder="10000"
                      style={{
                        width: "100%",
                        height: 42,
                        boxSizing: "border-box",
                        padding: "0 12px",
                        border: "1px solid #bfdbfe",
                        borderRadius: 9,
                        outline: "none",
                        fontSize: 13,
                      }}
                    />

                    {errors.budget && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          color: "#dc2626",
                          fontSize: 11,
                        }}
                      >
                        {errors.budget}
                      </span>
                    )}
                  </label>

                  <label>
                    <span
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      Objective
                    </span>

                    <select
                      value={form.objective}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          objective: event.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        height: 42,
                        boxSizing: "border-box",
                        padding: "0 12px",
                        border: "1px solid #bfdbfe",
                        borderRadius: 9,
                        outline: "none",
                        fontSize: 13,
                        background: "#ffffff",
                      }}
                    >
                      <option>Brand Awareness</option>
                      <option>Conversions</option>
                      <option>Engagement</option>
                      <option>Trust Building</option>
                      <option>Sales</option>
                      <option>Lead Generation</option>
                    </select>
                  </label>

                  <label>
                    <span
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      Start Date
                    </span>

                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          startDate: event.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        height: 42,
                        boxSizing: "border-box",
                        padding: "0 12px",
                        border: "1px solid #bfdbfe",
                        borderRadius: 9,
                        outline: "none",
                        fontSize: 13,
                      }}
                    />

                    {errors.startDate && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          color: "#dc2626",
                          fontSize: 11,
                        }}
                      >
                        {errors.startDate}
                      </span>
                    )}
                  </label>

                  <label>
                    <span
                      style={{
                        display: "block",
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      End Date
                    </span>

                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          endDate: event.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        height: 42,
                        boxSizing: "border-box",
                        padding: "0 12px",
                        border: "1px solid #bfdbfe",
                        borderRadius: 9,
                        outline: "none",
                        fontSize: 13,
                      }}
                    />

                    {errors.endDate && (
                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          color: "#dc2626",
                          fontSize: 11,
                        }}
                      >
                        {errors.endDate}
                      </span>
                    )}
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      resetForm();
                    }}
                    style={{
                      flex: 1,
                      height: 42,
                      border: "1px solid #bfdbfe",
                      background: "#ffffff",
                      color: "#2563eb",
                      borderRadius: 9,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCreate}
                    style={{
                      flex: 1,
                      height: 42,
                      border: "none",
                      background: "#2563eb",
                      color: "#ffffff",
                      borderRadius: 9,
                      cursor: "pointer",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    <Check size={16} />
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showView && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 520,
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #dbeafe",
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 19,
                  }}
                >
                  Campaign Details
                </h2>

                <button
                  type="button"
                  onClick={() => setShowView(null)}
                  style={{
                    border: "none",
                    background: "#eff6ff",
                    color: "#2563eb",
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    cursor: "pointer",
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              <h3
                style={{
                  margin: "0 0 7px",
                  color: "#2563eb",
                  fontSize: 18,
                }}
              >
                {showView.name}
              </h3>

              <p
                style={{
                  margin: "0 0 18px",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {showView.description}
              </p>

              {[
                ["Status", showView.status],
                ["Objective", showView.objective],
                ["Budget", formatCurrency(showView.budget)],
                ["Spent", formatCurrency(showView.spent)],
                ["Reach", formatNumber(showView.reach)],
                ["Posts", String(showView.posts)],
                [
                  "Dates",
                  `${formatDate(showView.startDate)} - ${formatDate(
                    showView.endDate
                  )}`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 20,
                    padding: "10px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    {label}
                  </span>

                  <strong
                    style={{
                      color: "#0f172a",
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  >
                    {value}
                  </strong>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShowView(null)}
                style={{
                  width: "100%",
                  height: 42,
                  marginTop: 18,
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 560,
                background: "#ffffff",
                borderRadius: 16,
                padding: 22,
                border: "1px solid #dbeafe",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    color: "#0f172a",
                  }}
                >
                  Edit Campaign
                </h2>

                <button
                  type="button"
                  onClick={() => setShowEdit(null)}
                  style={{
                    border: "none",
                    background: "#eff6ff",
                    color: "#2563eb",
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    cursor: "pointer",
                  }}
                >
                  <X size={17} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                <input
                  value={showEdit.name}
                  onChange={(event) =>
                    setShowEdit({
                      ...showEdit,
                      name: event.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    height: 42,
                    boxSizing: "border-box",
                    padding: "0 12px",
                    border: "1px solid #bfdbfe",
                    borderRadius: 9,
                    fontSize: 13,
                  }}
                />

                <textarea
               value={showEdit.description}
                  onChange={(event) =>
                    setShowEdit({
                      ...showEdit,
                      description: event.target.value,
                    })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 12,
                    border: "1px solid #bfdbfe",
                    borderRadius: 9,
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />

                <select
                  value={showEdit.status}
                  onChange={(event) =>
                    setShowEdit({
                      ...showEdit,
                      status:
                        event.target.value as CampaignStatus,
                    })
                  }
                  style={{
                    width: "100%",
                    height: 42,
                    border: "1px solid #bfdbfe",
                    borderRadius: 9,
                    padding: "0 12px",
                    fontSize: 13,
                    background: "#ffffff",
                  }}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowEdit(null)}
                    style={{
                      flex: 1,
                      height: 42,
                      border: "1px solid #bfdbfe",
                      background: "#ffffff",
                      color: "#2563eb",
                      borderRadius: 9,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleEditSave}
                    style={{
                      flex: 1,
                      height: 42,
                      border: "none",
                      background: "#2563eb",
                      color: "#ffffff",
                      borderRadius: 9,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteTarget && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                background: "#ffffff",
                borderRadius: 16,
                padding: 22,
                border: "1px solid #fecaca",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: "#fef2f2",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Trash2 size={19} />
              </div>

              <h2
                style={{
                  margin: "0 0 7px",
                  color: "#0f172a",
                  fontSize: 18,
                }}
              >
                Delete Campaign?
              </h2>

              <p
                style={{
                  margin: "0 0 20px",
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.name}</strong>? This action
                cannot be undone.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  style={{
                    flex: 1,
                    height: 42,
                    border: "1px solid #bfdbfe",
                    background: "#ffffff",
                    color: "#2563eb",
                    borderRadius: 9,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    height: 42,
                    border: "none",
                    background: "#dc2626",
                    color: "#ffffff",
                    borderRadius: 9,
                    cursor: "pointer",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CampaignsPage;   
