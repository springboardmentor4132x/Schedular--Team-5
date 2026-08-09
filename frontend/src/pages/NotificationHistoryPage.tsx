import { useState } from "react";
import {
  Bell,
  Check,
  CheckCircle,
  Calendar,
  BarChart3,
  AlertCircle,
  Info,
  Trash2,
  Search,
} from "lucide-react";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: "success" | "schedule" | "analytics" | "warning" | "info";
  date: string;
  time: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    title: "Post Published Successfully",
    message: "Your Instagram post was published successfully.",
    type: "success",
    date: "Aug 9, 2026",
    time: "10:30 AM",
    read: true,
  },
  {
    id: 2,
    title: "Post Scheduled",
    message: "Your Facebook post has been scheduled successfully.",
    type: "schedule",
    date: "Aug 9, 2026",
    time: "09:45 AM",
    read: true,
  },
  {
    id: 3,
    title: "Analytics Report Available",
    message: "Your weekly analytics report is ready to view.",
    type: "analytics",
    date: "Aug 8, 2026",
    time: "06:20 PM",
    read: true,
  },
  {
    id: 4,
    title: "Scheduled Post Failed",
    message: "Your scheduled post could not be published.",
    type: "warning",
    date: "Aug 8, 2026",
    time: "03:15 PM",
    read: true,
  },
  {
    id: 5,
    title: "Campaign Performance Update",
    message: "Your campaign reached 5,000 impressions this week.",
    type: "info",
    date: "Aug 7, 2026",
    time: "11:10 AM",
    read: true,
  },
];

export function NotificationHistoryPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Read" && notification.read) ||
      (filter === "Unread" && !notification.read);

    return matchesSearch && matchesFilter;
  });

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearHistory = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;

      case "schedule":
        return <Calendar size={20} />;

      case "analytics":
        return <BarChart3 size={20} />;

      case "warning":
        return <AlertCircle size={20} />;

      default:
        return <Info size={20} />;
    }
  };

  const getIconStyle = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";

      case "schedule":
        return "bg-blue-100 text-blue-600";

      case "analytics":
        return "bg-purple-100 text-purple-600";

      case "warning":
        return "bg-red-100 text-red-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3 text-white">
            <Bell size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notification History
            </h1>

            <p className="text-sm text-gray-500">
              View and manage your previous notifications
            </p>
          </div>
        </div>

        <button
          onClick={clearHistory}
          disabled={notifications.length === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={17} />
          Clear History
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {["All", "Read", "Unread"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === item
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Notification History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filteredNotifications.length > 0 ? (
          <div>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 border-b border-gray-100 p-5 hover:bg-gray-50 ${
                  !notification.read ? "bg-blue-50/40" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getIconStyle(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3
                        className={`text-sm ${
                          notification.read
                            ? "font-semibold text-gray-700"
                            : "font-bold text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>
                    </div>

                    {!notification.read && (
                      <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        Unread
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span>{notification.date}</span>
                    <span>•</span>
                    <span>{notification.time}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        <Check size={14} />
                        Mark as read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-5">
              <Bell size={32} className="text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              No notifications found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}