import React, { useMemo, useState } from "react";

type Status = "scheduled" | "published" | "draft" | "failed";

type Platform = "Instagram" | "Facebook" | "LinkedIn" | "X";

type Post = {
  id: number;
  title: string;
  content: string;
  date: Date;
  status: Status;
  platforms: Platform[];
  campaign?: string;
};

type ViewMode = "day" | "week" | "month";

const STATUS_LABELS: Record<Status, string> = {
  scheduled: "Scheduled",
  published: "Published",
  draft: "Draft",
  failed: "Failed",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  Instagram: "#e11d48",
  Facebook: "#2563eb",
  LinkedIn: "#0a66c2",
  X: "#111827",
};

const STATUS_COLORS: Record<Status, string> = {
  scheduled: "#2563eb",
  published: "#10b981",
  draft: "#94a3b8",
  failed: "#ef4444",
};

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Summer Campaign Launch",
    content: "Our summer campaign is officially live. Discover what's new this season!",
    date: new Date(2026, 7, 14, 10, 0),
    status: "scheduled",
    platforms: ["Instagram", "Facebook"],
    campaign: "Summer Campaign",
  },
  {
    id: 2,
    title: "Product Update",
    content: "A quick look at the latest product improvements and features.",
    date: new Date(2026, 7, 15, 14, 30),
    status: "draft",
    platforms: ["LinkedIn"],
    campaign: "Product Launch",
  },
  {
    id: 3,
    title: "Weekend Post",
    content: "Weekend inspiration for our community.",
    date: new Date(2026, 7, 16, 11, 0),
    status: "published",
    platforms: ["Instagram"],
  },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMonthDays(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const days: Date[] = [];

  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewMode>("month");
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newPlatform, setNewPlatform] =
    useState<Platform>("Instagram");

  const monthDays = useMemo(
    () => getMonthDays(currentDate),
    [currentDate]
  );

  const selectedDayPosts = useMemo(() => {
    if (!selectedPost) return [];

    return posts.filter((post) => sameDay(post.date, selectedPost.date));
  }, [posts, selectedPost]);

  function goToday() {
    setCurrentDate(new Date());
  }

  function previousPeriod() {
    const date = new Date(currentDate);

    if (currentView === "month") {
      date.setMonth(date.getMonth() - 1);
    } else if (currentView === "week") {
      date.setDate(date.getDate() - 7);
    } else {
      date.setDate(date.getDate() - 1);
    }

    setCurrentDate(date);
  }

  function nextPeriod() {
    const date = new Date(currentDate);

    if (currentView === "month") {
      date.setMonth(date.getMonth() + 1);
    } else if (currentView === "week") {
      date.setDate(date.getDate() + 7);
    } else {
      date.setDate(date.getDate() + 1);
    }

    setCurrentDate(date);
  }

  function deletePost(id: number) {
    setPosts((current) => current.filter((post) => post.id !== id));
    setShowPostModal(false);
    setSelectedPost(null);
  }

  function createPost() {
    if (!newTitle.trim() || !newDate) {
      return;
    }

    const createdDate = new Date(`${newDate}T${newTime}`);

    const post: Post = {
      id: Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: createdDate,
      status: "scheduled",
      platforms: [newPlatform],
    };

    setPosts((current) => [...current, post]);

    setNewTitle("");
    setNewContent("");
    setNewDate("");
    setNewTime("10:00");
    setNewPlatform("Instagram");
    setShowCreateModal(false);
  }

  function renderPost(post: Post) {
    return (
      <button
        key={post.id}
        type="button"
        onClick={() => openPost(post)}
        style={{
          width: "100%",
          border: "none",
          textAlign: "left",
          background: "#ffffff",
          borderLeft: `4px solid ${STATUS_COLORS[post.status]}`,
          borderRadius: "7px",
          padding: "7px",
          marginBottom: "6px",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "3px",
          }}
        >
          {formatTime(post.date)}
        </div>

        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#1e293b",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {post.title}
        </div>

        <div
          style={{
            display: "flex",
            gap: "4px",
            marginTop: "5px",
            flexWrap: "wrap",
          }}
        >
          {post.platforms.map((platform) => (
            <span
              key={platform}
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: PLATFORM_COLORS[platform],
                background: "#f8fafc",
                padding: "2px 5px",
                borderRadius: "4px",
              }}
            >
              {platform}
            </span>
          ))}
        </div>
      </button>
    );
  }

  function renderMonthView() {
    return (
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {weekDays.map((day) => (
            <div
              key={day}
              style={{
                padding: "12px 8px",
                textAlign: "center",
                color: "#64748b",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {monthDays.map((day) => {
            const dayPosts = posts.filter((post) =>
              sameDay(post.date, day)
            );

            const isCurrentMonth =
              day.getMonth() === currentDate.getMonth();

            const isToday = sameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                style={{
                  minHeight: "145px",
                  padding: "8px",
                  borderRight: "1px solid #e2e8f0",
                  borderBottom: "1px solid #e2e8f0",
                  background: isCurrentMonth
                    ? "#ffffff"
                    : "#f8fafc",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: isToday ? "#2563eb" : "transparent",
                    color: isToday
                      ? "#ffffff"
                      : isCurrentMonth
                      ? "#334155"
                      : "#94a3b8",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  {day.getDate()}
                </div>

                {dayPosts.map(renderPost)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderWeekView() {
    const start = startOfWeek(currentDate);

    const days = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });

   return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        {days.map((day) => {
          const dayPosts = posts.filter((post) =>
            sameDay(post.date, day)
          );

          const isToday = sameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              style={{
                minHeight: "500px",
                borderRight: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  background: isToday ? "#eff6ff" : "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {weekDays[day.getDay()]}
                </div>

                <div
                  style={{
                    color: isToday ? "#2563eb" : "#1e293b",
                    fontSize: "20px",
                    fontWeight: 800,
                    marginTop: "3px",
                  }}
                >
                  {day.getDate()}
                </div>
              </div>

              <div style={{ padding: "8px" }}>
                {dayPosts.length > 0 ? (
                  dayPosts.map(renderPost)
                ) : (
                  <div
                    style={{
                      color: "#cbd5e1",
                      fontSize: "11px",
                      textAlign: "center",
                      paddingTop: "20px",
                    }}
                  >
                    No posts
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  function renderDayView() {
    const dayPosts = posts.filter((post) =>
      sameDay(post.date, currentDate)
    );

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "20px",
        }}
      >
        <div
          style={{
            color: "#1e293b",
            fontSize: "18px",
            fontWeight: 800,
            marginBottom: "16px",
          }}
        >
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        {dayPosts.length > 0 ? (
          <div style={{ display: "grid", gap: "10px" }}>
            {dayPosts.map((post) => (
              <div key={post.id}>{renderPost(post)}</div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              color: "#64748b",
              background: "#f8fafc",
              borderRadius: "12px",
            }}
          >
            No posts scheduled for this day.
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#1e293b",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Calendar
            </h1>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Manage and schedule your social media posts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            style={{
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              borderRadius: "9px",
              padding: "11px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Create Post
          </button>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <button
              type="button"
              onClick={previousPeriod}
              style={{
                width: "34px",
                height: "34px",
                border: "1px solid #dbeafe",
                background: "#ffffff",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#2563eb",
                fontSize: "18px",
              }}
            >
              ‹
            </button>

            <button
              type="button"
onClick={nextPeriod}
              style={{
                width: "34px",
                height: "34px",
                border: "1px solid #dbeafe",
                background: "#ffffff",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#2563eb",
                fontSize: "18px",
              }}
            >
              ›
            </button>

            <button
              type="button"
              onClick={goToday}
              style={{
                border: "1px solid #dbeafe",
                background: "#eff6ff",
                color: "#2563eb",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Today
            </button>

            <div
              style={{
                marginLeft: "8px",
                fontSize: "16px",
                fontWeight: 800,
                color: "#1e293b",
              }}
            >
              {currentView === "month"
                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              background: "#f1f5f9",
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            {(["day", "week", "month"] as ViewMode[]).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setCurrentView(view)}
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  background:
                    currentView === view ? "#ffffff" : "transparent",
                  color:
                    currentView === view ? "#2563eb" : "#64748b",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        {currentView === "month" && renderMonthView()}
        {currentView === "week" && renderWeekView()}
        {currentView === "day" && renderDayView()}

        {/* Post Details Modal */}
        {showPostModal && selectedPost && (
          <div
            onClick={() => setShowPostModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "520px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "16px",
                padding: "22px",
                boxSizing: "border-box",
                boxShadow: "0 20px 50px rgba(15,23,42,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#0f172a",
                  }}
                >
                  Post Details
                </h2>

                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  style={{
                    border: "none",
                    background: "#f1f5f9",
                    color: "#475569",
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    TITLE
                  </p>

                  <div
                    style={{
                      color: "#1e293b",
                      fontSize: "16px",
                      fontWeight: 800,
                    }}
                  >
                    {selectedPost.title}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      background: `${STATUS_COLORS[selectedPost.status]}18`,
                      color: STATUS_COLORS[selectedPost.status],
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: STATUS_COLORS[selectedPost.status],
                      }}
                    />
                    {STATUS_LABELS[selectedPost.status]}
                  </span>

                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    {formatTime(selectedPost.date)} ·{" "}
                    {selectedPost.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div>
                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    CONTENT
                  </p>

                  <div
                    style={{
                      background: "#f8fbff",
                      border: "1px solid #dbeafe",
                      borderRadius: "10px",
                      padding: "14px",
                      color: "#334155",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedPost.content || "No content added."}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      margin: "0 0 7px",
                      color: "#64748b",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    PLATFORMS
                  </p>

                  <div
                    style={{
                      display:

                "flex",
                      gap: "7px",
                      flexWrap: "wrap",
                    }}
                  >
                    {selectedPost.platforms.map((platform) => (
                      <span
                        key={platform}
                        style={{
                          padding: "6px 9px",
                          borderRadius: "7px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: PLATFORM_COLORS[platform],
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedPost.campaign && (
                  <div>
                    <p
                      style={{
                        margin: "0 0 7px",
                        color: "#64748b",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      CAMPAIGN
                    </p>

                    <div
                      style={{
                        padding: "9px 11px",
                        background: "#eff6ff",
                        border: "1px solid #dbeafe",
                        borderRadius: "8px",
                        color: "#1e3a8a",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {selectedPost.campaign}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    style={{
                      flex: 1,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      borderRadius: "9px",
                      padding: "10px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePost(selectedPost.id)}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "#ef4444",
                      color: "#ffffff",
                      borderRadius: "9px",
                      padding: "10px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div
            onClick={() => setShowCreateModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "500px",
                background: "#ffffff",
                borderRadius: "16px",
                padding: "22px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#0f172a",
                  }}
                >
                  Create Post
                </h2>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    border: "none",
                    background: "#f1f5f9",
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "#475569",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "grid", gap: "13px" }}>
                <label
                  style={{
                    display: "grid",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  Title
                  <input
                    value={newTitle}  
                     onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="Enter post title"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px",
                      outline: "none",
                      fontSize: "13px",
                    }}
                  />
                </label>

                <label
                  style={{
                    display: "grid",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  Content
                  <textarea
                    value={newContent}
                    onChange={(event) =>
                      setNewContent(event.target.value)
                    }
                    placeholder="Write your post..."
                    rows={4}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px",
                      resize: "vertical",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <label
                    style={{
                      display: "grid",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    Date
                    <input
                      type="date"
                      value={newDate}
                      onChange={(event) =>
                        setNewDate(event.target.value)
                      }
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "13px",
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: "grid",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    Time
                    <input
                      type="time"
                      value={newTime}
                      onChange={(event) =>
                        setNewTime(event.target.value)
                      }
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "10px",
                        fontSize: "13px",
                      }}
                    />
                  </label>
                </div>

                <label
                  style={{
                    display: "grid",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#475569",
                  }}
                >
                  Platform
                  <select
                    value={newPlatform}
                    onChange={(event) =>
                      setNewPlatform(event.target.value as Platform)
                    }
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "10px",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X">X</option>
                  </select>
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "5px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      flex: 1,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#475569",
                      borderRadius: "9px",
                      padding: "11px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                     onClick={createPost}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "#2563eb",
                      color: "#ffffff",
                      borderRadius: "9px",
                      padding: "11px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Create Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarPage; 
