import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  BarChart3,
  Megaphone,
  Share2,
  Bell,
  Settings,
  Sparkles,
  X,
  Zap,
<<<<<<< HEAD
  Mail,
  Users,
  SlidersHorizontal,
=======
  Users,
  UserCheck,
  ClipboardList,
  Send,
  User,
  LogOut,
>>>>>>> origin/shravanik-latest-scheduler
} from 'lucide-react';
import { cn } from '../utils/helpers';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

<<<<<<< HEAD
=======
type UserRole =
  | 'administrator'
  | 'marketing_team'
  | 'content_creator'
  | 'business_user';

>>>>>>> origin/shravanik-latest-scheduler
const navItems = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
<<<<<<< HEAD
  },
  {
    to: '/app/social-accounts',
    label: 'Social Accounts',
    icon: Share2,
  },
  {
    to: '/app/create-post',
    label: 'Create Post',
    icon: FileText,
=======
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },
  {
    to: '/app/posts',
    label: 'My Posts',
    icon: ClipboardList,
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },
  {
    to: '/app/clients',
    label: 'My Clients',
    icon: Users,
    roles: [
      'marketing_team',
    ],
>>>>>>> origin/shravanik-latest-scheduler
  },
  {
    to: '/app/calendar',
    label: 'Calendar',
    icon: Calendar,
<<<<<<< HEAD
=======
    roles: [
      'marketing_team',
      'content_creator',
      'business_user',
    ],
>>>>>>> origin/shravanik-latest-scheduler
  },
  {
    to: '/app/campaigns',
    label: 'Campaigns',
    icon: Megaphone,
<<<<<<< HEAD
=======
    roles: [
      'administrator',
      'marketing_team',
      'business_user',
    ],
  },
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
  {
    to: '/app/create-post',
    label: 'Create Post',
    icon: FileText,
    roles: [
      'content_creator',
    ],
  },
  {
    to: '/app/publishing',
    label: 'Publishing Hub',
    icon: Send,
    roles: [
      'marketing_team',
      'content_creator',
      'business_user',
    ],
>>>>>>> origin/shravanik-latest-scheduler
  },
  {
    to: '/app/analytics',
    label: 'Analytics',
    icon: BarChart3,
<<<<<<< HEAD
  },

  // Module 7 — Notifications
=======
    roles: [
      'marketing_team',
      'business_user',
    ],
  },
>>>>>>> origin/shravanik-latest-scheduler
  {
    to: '/app/notifications',
    label: 'Notifications',
    icon: Bell,
<<<<<<< HEAD
  },

  // Module 8 — Reports
  {
    to: '/app/reports',
    label: 'Reports',
    icon: FileText,
  },

=======
    roles: [
      'administrator',
      'marketing_team',
      'content_creator',
      'business_user',
    ],
  },
  {
    to: '/app/my-marketing-team',
    label: 'My Marketing Team',
    icon: UserCheck,
    roles: [
      'business_user',
    ],
  },
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
>>>>>>> origin/shravanik-latest-scheduler
  {
    to: '/app/settings',
    label: 'Settings',
    icon: Settings,
<<<<<<< HEAD
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
=======
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
        return item.roles.includes(
          'content_creator'
        );
      }

      return item.roles.includes(role);
    });

  const handleSignOut = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

>>>>>>> origin/shravanik-latest-scheduler
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
<<<<<<< HEAD
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64',
          'bg-white border-r border-gray-200',
          'flex flex-col',
          'lg:translate-x-0 lg:!transform-none'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200">
          <div className="flex items-center gap-2">

            {/* Logo icon */}
=======
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col',
          'lg:translate-x-0 lg:!transform-none'
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200">
          <div className="flex items-center gap-2">
>>>>>>> origin/shravanik-latest-scheduler
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap
                className="w-5 h-5 text-white"
                fill="white"
              />
            </div>

<<<<<<< HEAD
            {/* Logo text */}
=======
>>>>>>> origin/shravanik-latest-scheduler
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">
                SocialPilot
              </p>

              <p className="text-[10px] text-gray-500 mt-0.5">
                Campaign Manager
              </p>
            </div>
          </div>

<<<<<<< HEAD
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Close sidebar"
=======
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
>>>>>>> origin/shravanik-latest-scheduler
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

<<<<<<< HEAD
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">

=======
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
>>>>>>> origin/shravanik-latest-scheduler
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>

          <ul className="space-y-1">
<<<<<<< HEAD

            {navItems.map((item) => (
              <li key={item.to}>

                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'sidebar-link group',
                      isActive && 'sidebar-link-active'
                    )
                  }
                >

                  {({ isActive }) => (
                    <>
                      {/* Icon */}
                      <item.icon
                        className={cn(
                          'w-5 h-5 transition-colors',
                          isActive
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-600'
                        )}
                      />

                      {/* Label */}
                      <span className="flex-1">
                        {item.label}
                      </span>

                      {/* Active indicator */}
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
            ))}

          </ul>
        </nav>

        {/* Upgrade Card */}
        <div className="p-3 border-t border-gray-200">

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white">

            {/* Background circles */}
=======
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

        <div className="p-3 border-t border-gray-200">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 text-white">
>>>>>>> origin/shravanik-latest-scheduler
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />

            <div className="absolute -right-8 -bottom-8 w-20 h-20 rounded-full bg-white/10" />

            <div className="relative">
<<<<<<< HEAD

              {/* Title */}
=======
>>>>>>> origin/shravanik-latest-scheduler
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />

                <p className="text-sm font-semibold">
                  Upgrade to Pro
                </p>
              </div>

<<<<<<< HEAD
              {/* Description */}
              <p className="text-xs text-white/80 mb-3">
                Unlock advanced analytics & unlimited scheduling
              </p>

              {/* Button */}
              <button
                type="button"
                className="w-full bg-white text-indigo-600 text-xs font-semibold py-2 rounded-lg hover:bg-white/90 transition-colors"
              >
                Upgrade Now
              </button>

            </div>
          </div>

        </div>

=======
              <p className="text-xs text-white/80 mb-3">
                Unlock advanced analytics &
                unlimited scheduling
              </p>

              <button className="w-full bg-white text-indigo-600 text-xs font-semibold py-2 rounded-lg hover:bg-white/90 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 mt-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
>>>>>>> origin/shravanik-latest-scheduler
      </motion.aside>
    </>
  );
}