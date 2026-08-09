import { useState } from 'react';
import {
  Users,
  MessageSquare,
  CheckCircle,
  FileText,
  Calendar,
  UserPlus,
  Search,
} from 'lucide-react';

type Activity = {
  id: number;
  user: string;
  action: string;
  target: string;
  campaign: string;
  time: string;
  type: 'comment' | 'approval' | 'post' | 'schedule' | 'member';
};

const initialActivities: Activity[] = [
  {
    id: 1,
    user: 'Alex Johnson',
    action: 'commented on',
    target: 'Summer Campaign Post',
    campaign: 'Summer Sale',
    time: '10 minutes ago',
    type: 'comment',
  },
  {
    id: 2,
    user: 'Sarah Wilson',
    action: 'approved',
    target: 'Instagram Campaign',
    campaign: 'Product Launch Q3',
    time: '35 minutes ago',
    type: 'approval',
  },
  {
    id: 3,
    user: 'Mike Brown',
    action: 'created',
    target: 'New Facebook Post',
    campaign: 'Content Marketing',
    time: '1 hour ago',
    type: 'post',
  },
  {
    id: 4,
    user: 'Emily Davis',
    action: 'scheduled',
    target: 'Product Launch Post',
    campaign: 'Product Launch Q3',
    time: '2 hours ago',
    type: 'schedule',
  },
  {
    id: 5,
    user: 'John Smith',
    action: 'joined the team',
    target: '',
    campaign: 'No Campaign',
    time: '3 hours ago',
    type: 'member',
  },
];

export function TeamActivityPage() {
  const [activities] = useState<Activity[]>(initialActivities);

  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  const filteredActivities = activities.filter((activity) => {
    const text =
      `${activity.user} ${activity.action} ${activity.target} ${activity.campaign}`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesCampaign =
      campaignFilter === 'All' ||
      activity.campaign === campaignFilter;

    const matchesUser =
      userFilter === 'All' ||
      activity.user === userFilter;

    return matchesSearch && matchesCampaign && matchesUser;
  });

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={20} />;

      case 'approval':
        return <CheckCircle size={20} />;

      case 'post':
        return <FileText size={20} />;

      case 'schedule':
        return <Calendar size={20} />;

      case 'member':
        return <UserPlus size={20} />;

      default:
        return <Users size={20} />;
    }
  };

  const getIconStyle = (type: Activity['type']) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-100 text-blue-600';

      case 'approval':
        return 'bg-green-100 text-green-600';

      case 'post':
        return 'bg-purple-100 text-purple-600';

      case 'schedule':
        return 'bg-orange-100 text-orange-600';

      case 'member':
        return 'bg-indigo-100 text-indigo-600';

      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-3 text-white">
            <Users size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Team Activity
            </h1>

            <p className="text-sm text-gray-500">
              View recent activity from your team members
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 md:flex-row md:items-center">

          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search team activity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Campaign Filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-600"
          >
            <option value="All">All Campaigns</option>
            <option value="Summer Sale">Summer Sale</option>
            <option value="Product Launch Q3">
              Product Launch Q3
            </option>
            <option value="Content Marketing">
              Content Marketing
            </option>
            <option value="No Campaign">No Campaign</option>
          </select>

          {/* User Filter */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-600"
          >
            <option value="All">All Users</option>
            <option value="Alex Johnson">Alex Johnson</option>
            <option value="Sarah Wilson">Sarah Wilson</option>
            <option value="Mike Brown">Mike Brown</option>
            <option value="Emily Davis">Emily Davis</option>
            <option value="John Smith">John Smith</option>
          </select>

        </div>
      </div>

      {/* Activity List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Recent Team Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredActivities.length} activities found
          </p>
        </div>

        {filteredActivities.length > 0 ? (
          <div>

            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 border-b border-gray-100 p-5 hover:bg-gray-50"
              >

                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getIconStyle(
                    activity.type
                  )}`}
                >
                  {getIcon(activity.type)}
                </div>

                {/* Activity Details */}
                <div className="min-w-0 flex-1">

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">
                      {activity.user}
                    </span>{' '}
                    {activity.action}{' '}

                    {activity.target && (
                      <span className="font-semibold text-gray-900">
                        {activity.target}
                      </span>
                    )}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>{activity.time}</span>

                    <span>•</span>

                    <span>
                      Campaign: {activity.campaign}
                    </span>
                  </div>

                </div>
              </div>
            ))}

          </div>
        ) : (

          /* Empty State */
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="mb-4 rounded-full bg-gray-100 p-5">
              <Users size={32} className="text-gray-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              No activity found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}