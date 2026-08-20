import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Share2,
  Bell,
  Settings,
  X,
  Users,
  UserCheck,
  ClipboardList,
  User,
  History,
  Activity,
  UserCog,
  Building2,
  UsersRound,
  FileBarChart,
  PlusCircle,
} from 'lucide-react';
import { cn } from '../utils/helpers';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type UserRole =
  | 'administrator'
  | 'marketing_team'
  | 'content_creator'
  | 'business_user';

const navItems = [
  /* =====================================================
     DASHBOARD
  ===================================================== */

  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     ADMINISTRATION
  ===================================================== */

  {
    to: '/app/users',
    label: 'Users',
    icon: UserCog,
    roles: [
      'administrator',
    ],
  },

  {
    to: '/app/business-accounts',
    label: 'Business Accounts',
    icon: Building2,
    roles: [
      'administrator',
    ],
  },

  {
    to: '/app/marketing-teams',
    label: 'Marketing Teams',
    icon: UsersRound,
    roles: [
      'administrator',
    ],
  },

  {
    to: '/app/content-creators',
    label: 'Content Creators',
    icon: UserCheck,
    roles: [
      'administrator',
    ],
  },

  /* =====================================================
     MY POSTS

     Administrator does NOT have My Posts.
  ===================================================== */

  {
    to: '/app/posts',
    label: 'My Posts',
    icon: ClipboardList,
    roles: [
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     CREATE POST

     Administrator does NOT create posts.
     Marketing Team, Content Creator and Business User
     can create and schedule posts.
  ===================================================== */

  {
    to: '/app/create-post',
    label: 'Create Post',
    icon: PlusCircle,
    roles: [
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     CAMPAIGNS

     Administrator does NOT have Campaigns.
  ===================================================== */

  {
    to: '/app/campaigns',
    label: 'Campaigns',
    icon: Megaphone,
    roles: [
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     SOCIAL ACCOUNTS
  ===================================================== */

  {
    to: '/app/accounts',
    label: 'Social Accounts',
    icon: Share2,
    roles: [
      'administrator',
      'marketing_team',
      'business_user',
      'content_creator',
    ],
  },

  /* =====================================================
     ANALYTICS

     Administrator now has Analytics access.
  ===================================================== */

  {
    to: '/app/analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: [
      'administrator',
      'marketing_team',
      'business_user',
      'content_creator',
    ],
  },

  /* =====================================================
     REPORTS
  ===================================================== */

  {
    to: '/app/reports',
    label: 'Reports',
    icon: FileBarChart,
    roles: [
      'administrator',
      'marketing_team',
      'business_user',
    ],
  },

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  {
    to: '/app/notifications',
    label: 'Notifications',
    icon: Bell,
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     NOTIFICATION HISTORY
  ===================================================== */

  {
    to: '/app/notification-history',
    label: 'Notification History',
    icon: History,
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     TEAM ACTIVITY
  ===================================================== */

  {
    to: '/app/team-activity',
    label: 'Team Activity',
    icon: Activity,
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     PROFILE
  ===================================================== */

  {
    to: '/app/profile',
    label: 'Profile',
    icon: User,
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },

  /* =====================================================
     SETTINGS
  ===================================================== */

  {
    to: '/app/settings',
    label: 'Settings',
    icon: Settings,
    roles: [
      'administrator',
    ],
  },
];

export function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const storedRole = localStorage.getItem(
    'user_role'
  );

  const role = storedRole as UserRole | null;

  const filteredNavItems =
    navItems.filter((item) => {
      if (!role) {
        return false;
      }

      return item.roles.includes(role);
    });

  return (
    <>
      {/* =================================================
          MOBILE BACKDROP
      ================================================= */}

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : '-100%',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col',
          'lg:translate-x-0 lg:!transform-none'
        )}
      >

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200">

          <div className="flex items-center gap-2">

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">

              <div className="w-5 h-5 rounded-md bg-white/90 flex items-center justify-center">

                <span className="text-indigo-600 text-xs font-bold">
                  S
                </span>

              </div>

            </div>

            <div>

              <p className="text-sm font-bold text-gray-900 leading-none">
                SocialPilot
              </p>

              <p className="text-[10px] text-gray-500 mt-0.5">
                Campaign Manager
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 px-3 py-4 overflow-y-auto">

          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>

          <ul className="space-y-1">

            {filteredNavItems.map(
              (item) => (
                <li key={item.to}>

                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'sidebar-link group',
                        isActive &&
                          'sidebar-link-active'
                      )
                    }
                  >

                    {({ isActive }) => (
                      <>

                        <item.icon
                          className={cn(
                            'w-5 h-5 transition-colors',
                            isActive
                              ? 'text-indigo-600'
                              : 'text-gray-400 group-hover:text-gray-600'
                          )}
                        />

                        <span>
                          {item.label}
                        </span>

                        {isActive && (
                          <motion.div
                            layoutId="sidebar-indicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                          />
                        )}

                      </>
                    )}

                  </NavLink>

                </li>
              )
            )}

          </ul>

        </nav>

      </motion.aside>
    </>
  );
}