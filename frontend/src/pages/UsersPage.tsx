import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  userService,
  type User,
} from '../services/api';

/* =========================================================
   TYPES
========================================================= */

type RoleFilter =
  | 'all'
  | 'administrator'
  | 'marketing_team'
  | 'business_user'
  | 'content_creator';

type CurrentUser = {
  id?: number;
  username?: string;
  role?: string;
};

/* =========================================================
   HELPERS
========================================================= */

const formatRole = (
  role: string
) => {
  switch (role) {
    case 'administrator':
      return 'Administrator';

    case 'marketing_team':
      return 'Marketing Team';

    case 'business_user':
      return 'Business User';

    case 'content_creator':
      return 'Content Creator';

    default:
      return role
        ? role
            .replace(
              /_/g,
              ' '
            )
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase()
            )
        : 'Unknown';
  }
};

/* =========================================================
   USERS PAGE
========================================================= */

export const UsersPage: React.FC = () => {
  /* =======================================================
     STATE
  ======================================================= */

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>('');

  const [searchTerm, setSearchTerm] =
    useState<string>('');

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>('all');

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [deletingUserId, setDeletingUserId] =
    useState<number | null>(null);

  /* =======================================================
     LOAD CURRENT USER
  ======================================================= */

  const loadCurrentUser =
    useCallback(
      async () => {
        try {
          const response =
            await userService.getCurrentUser();

          setCurrentUser(
            response.data
          );
        } catch (error) {
          console.warn(
            'Unable to load current user:',
            error
          );
        }
      },
      []
    );

  /* =======================================================
     LOAD USERS
  ======================================================= */

  const loadUsers =
    useCallback(
      async (
        showRefreshLoader = false
      ) => {
        try {
          if (
            showRefreshLoader
          ) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError('');

          const response =
            await userService.getAll();

          setUsers(
            Array.isArray(
              response.data
            )
              ? response.data
              : []
          );
        } catch (error: any) {
          console.error(
            'Failed to load users:',
            error
          );

          const message =
            error?.response
              ?.data?.detail ||
            error?.response
              ?.data?.message ||
            'Failed to load users. Please try again.';

          setError(message);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, [
    loadUsers,
    loadCurrentUser,
  ]);

  /* =======================================================
     DELETE USER
  ======================================================= */

  const handleDelete = async (
    user: User
  ) => {
    if (!user.id) {
      return;
    }

    /* -----------------------------------------------------
       Do not allow current user to delete themselves
    ----------------------------------------------------- */

    if (
      currentUser?.id !== undefined &&
      currentUser.id === user.id
    ) {
      window.alert(
        'You cannot delete your own account.'
      );

      return;
    }

    /* -----------------------------------------------------
       Administrator cannot be deleted
    ----------------------------------------------------- */

    if (
      user.role ===
      'administrator'
    ) {
      window.alert(
        'The Administrator account cannot be deleted.'
      );

      return;
    }

    /* -----------------------------------------------------
       Confirmation
    ----------------------------------------------------- */

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${user.full_name || user.username}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(
        user.id
      );

      setError('');

      await userService.deleteUser(
        user.id
      );

      /* ---------------------------------------------------
         Remove deleted user from current UI
      --------------------------------------------------- */

      setUsers(
        (previousUsers) =>
          previousUsers.filter(
            (item) =>
              item.id !== user.id
          )
      );

      window.alert(
        'User deleted successfully.'
      );
    } catch (error: any) {
      console.error(
        'Failed to delete user:',
        error
      );

      const message =
        error?.response
          ?.data?.detail ||
        error?.response
          ?.data?.message ||
        'Failed to delete user. Please try again.';

      setError(message);

      window.alert(message);
    } finally {
      setDeletingUserId(null);
    }
  };

  /* =======================================================
     FILTER USERS
  ======================================================= */

  const filteredUsers =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          /* -----------------------------------------------
             Role filter
          ----------------------------------------------- */

          if (
            roleFilter !==
              'all' &&
            user.role !==
              roleFilter
          ) {
            return false;
          }

          /* -----------------------------------------------
             Search filter
          ----------------------------------------------- */

          if (!search) {
            return true;
          }

          const roleLabel =
            formatRole(
              user.role
            ).toLowerCase();

          return (
            user.username
              ?.toLowerCase()
              .includes(search) ||
            user.email
              ?.toLowerCase()
              .includes(search) ||
            user.full_name
              ?.toLowerCase()
              .includes(search) ||
            roleLabel.includes(
              search
            ) ||
            String(
              user.id
            ).includes(search)
          );
        }
      );
    }, [
      users,
      searchTerm,
      roleFilter,
    ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalUsers =
    users.length;

  const administrators =
    users.filter(
      (user) =>
        user.role ===
        'administrator'
    ).length;

  const marketingTeams =
    users.filter(
      (user) =>
        user.role ===
        'marketing_team'
    ).length;

  const businessUsers =
    users.filter(
      (user) =>
        user.role ===
        'business_user'
    ).length;

  const contentCreators =
    users.filter(
      (user) =>
        user.role ===
        'content_creator'
    ).length;

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    () => {
      loadUsers(true);
    };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters =
    () => {
      setSearchTerm('');
      setRoleFilter('all');
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="users-page">
      <style>
        {`
          .users-page {
            width: 100%;
            padding: 24px;
            box-sizing: border-box;
          }

          .users-page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 24px;
          }

          .users-page-title {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #111827;
          }

          .users-page-description {
            margin: 8px 0 0;
            color: #6b7280;
            font-size: 14px;
          }

          .users-refresh-button {
            border: 1px solid #d1d5db;
            background: #ffffff;
            color: #111827;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          }

          .users-refresh-button:hover {
            background: #f9fafb;
          }

          .users-refresh-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .users-error {
            margin-bottom: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #b91c1c;
            font-size: 14px;
          }

          .users-error-actions {
            margin-top: 10px;
          }

          .users-retry-button {
            border: 1px solid #dc2626;
            background: #ffffff;
            color: #dc2626;
            padding: 7px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          }

          .users-stat-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 28px;
          }

          .users-stat-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px;
          }

          .users-stat-label {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 8px;
          }

          .users-stat-value {
            color: #111827;
            font-size: 26px;
            font-weight: 700;
          }

          .users-section {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
          }

          .users-section-header {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
          }

          .users-section-title {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            color: #111827;
          }

          .users-section-subtitle {
            margin: 6px 0 18px;
            color: #6b7280;
            font-size: 13px;
          }

          .users-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .users-search-input {
            flex: 1;
            min-width: 250px;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            outline: none;
            font-size: 14px;
            box-sizing: border-box;
          }

          .users-search-input:focus {
            border-color: #6b7280;
          }

          .users-role-select {
            min-width: 190px;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: #ffffff;
            color: #374151;
            font-size: 14px;
            outline: none;
          }

          .users-clear-button {
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: #ffffff;
            color: #374151;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
          }

          .users-clear-button:hover {
            background: #f9fafb;
          }

          .users-table-wrapper {
            width: 100%;
            overflow-x: auto;
          }

          .users-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 850px;
          }

          .users-table th {
            text-align: left;
            padding: 13px 16px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            border-bottom: 1px solid #e5e7eb;
          }

          .users-table td {
            padding: 16px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: middle;
            font-size: 14px;
          }

          .users-table tr:last-child td {
            border-bottom: none;
          }

          .users-name {
            color: #111827;
            font-weight: 700;
          }

          .users-username {
            margin-top: 4px;
            color: #6b7280;
            font-size: 12px;
          }

          .users-email {
            color: #374151;
          }

          .users-role {
            display: inline-flex;
            align-items: center;
            padding: 5px 9px;
            border-radius: 999px;
            background: #f3f4f6;
            color: #374151;
            font-size: 12px;
            font-weight: 700;
          }

          .users-role-admin {
            background: #ede9fe;
            color: #6d28d9;
          }

          .users-role-marketing {
            background: #dbeafe;
            color: #1d4ed8;
          }

          .users-role-business {
            background: #dcfce7;
            color: #15803d;
          }

          .users-role-creator {
            background: #fef3c7;
            color: #b45309;
          }

          .users-phone {
            color: #4b5563;
          }

          .users-id {
            color: #6b7280;
            font-weight: 600;
          }

          .users-delete-button {
            border: 1px solid #fecaca;
            background: #ffffff;
            color: #dc2626;
            padding: 7px 12px;
            border-radius: 7px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 700;
          }

          .users-delete-button:hover {
            background: #fef2f2;
          }

          .users-delete-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .users-loading {
            padding: 45px 20px;
            text-align: center;
            color: #6b7280;
          }

          .users-empty {
            padding: 45px 20px;
            text-align: center;
            color: #6b7280;
          }

          .users-empty-title {
            margin-bottom: 8px;
            color: #374151;
            font-weight: 600;
          }

          .users-mobile-list {
            display: none;
          }

          .users-mobile-card {
            padding: 18px;
            border-bottom: 1px solid #e5e7eb;
          }

          .users-mobile-card:last-child {
            border-bottom: none;
          }

          .users-mobile-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 12px;
          }

          .users-mobile-name {
            color: #111827;
            font-weight: 700;
          }

          .users-mobile-username {
            margin-top: 4px;
            color: #6b7280;
            font-size: 12px;
          }

          .users-mobile-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 7px 0;
            font-size: 13px;
          }

          .users-mobile-label {
            color: #6b7280;
          }

          .users-mobile-value {
            color: #374151;
            text-align: right;
          }

          @media (max-width: 1100px) {
            .users-stat-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }

          @media (max-width: 700px) {
            .users-page {
              padding: 16px;
            }

            .users-page-header {
              flex-direction: column;
            }

            .users-refresh-button {
              width: 100%;
            }

            .users-stat-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .users-table-wrapper {
              display: none;
            }

            .users-mobile-list {
              display: block;
            }

            .users-controls {
              flex-direction: column;
              align-items: stretch;
            }

            .users-search-input,
            .users-role-select,
            .users-clear-button {
              width: 100%;
              min-width: 0;
            }
          }

          @media (max-width: 450px) {
            .users-stat-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="users-page-header">
        <div>
          <h1 className="users-page-title">
            Users
          </h1>

          <p className="users-page-description">
            Manage all users registered on
            your SocialPilot platform.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          onClick={handleRefresh}
          disabled={
            loading ||
            refreshing
          }
        >
          {refreshing
            ? 'Refreshing...'
            : 'Refresh'}
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="users-error">
          <div>
            {error}
          </div>

          <div className="users-error-actions">
            <button
              type="button"
              className="users-retry-button"
              onClick={() =>
                loadUsers()
              }
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="users-stat-grid">
        <div className="users-stat-card">
          <div className="users-stat-label">
            Total Users
          </div>

          <div className="users-stat-value">
            {totalUsers}
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">
            Administrators
          </div>

          <div className="users-stat-value">
            {administrators}
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">
            Marketing Teams
          </div>

          <div className="users-stat-value">
            {marketingTeams}
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">
            Business Users
          </div>

          <div className="users-stat-value">
            {businessUsers}
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">
            Content Creators
          </div>

          <div className="users-stat-value">
            {contentCreators}
          </div>
        </div>
      </div>

      {/* =====================================================
          ALL USERS
      ===================================================== */}

      <div className="users-section">
        <div className="users-section-header">
          <h2 className="users-section-title">
            All Users
          </h2>

          <p className="users-section-subtitle">
            {filteredUsers.length}{' '}
            {filteredUsers.length ===
            1
              ? 'user'
              : 'users'}{' '}
            displayed
          </p>

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <div className="users-controls">
            <input
              type="text"
              className="users-search-input"
              placeholder="Search by name, username, email, role or ID..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

            <select
              className="users-role-select"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target
                    .value as RoleFilter
                )
              }
            >
              <option value="all">
                All Roles
              </option>

              <option value="administrator">
                Administrators
              </option>

              <option value="marketing_team">
                Marketing Teams
              </option>

              <option value="business_user">
                Business Users
              </option>

              <option value="content_creator">
                Content Creators
              </option>
            </select>

            {(searchTerm ||
              roleFilter !==
                'all') && (
              <button
                type="button"
                className="users-clear-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading ? (
          <div className="users-loading">
            Loading users...
          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="users-empty">
            <div className="users-empty-title">
              No users found
            </div>

            {(searchTerm ||
              roleFilter !==
                'all') && (
              <button
                type="button"
                className="users-clear-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =============================================
                DESKTOP TABLE
            ============================================= */}

            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>
                      User
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Role
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      ID
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (user) => {
                      const isCurrentUser =
                        currentUser?.id ===
                        user.id;

                      const isAdministrator =
                        user.role ===
                        'administrator';

                      const isDeleting =
                        deletingUserId ===
                        user.id;

                      return (
                        <tr
                          key={user.id}
                        >
                          <td>
                            <div className="users-name">
                              {user.full_name ||
                                user.username}
                            </div>

                            <div className="users-username">
                              @{user.username}
                            </div>
                          </td>

                          <td>
                            <span className="users-email">
                              {user.email}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`users-role ${
                                user.role ===
                                'administrator'
                                  ? 'users-role-admin'
                                  : user.role ===
                                    'marketing_team'
                                  ? 'users-role-marketing'
                                  : user.role ===
                                    'business_user'
                                  ? 'users-role-business'
                                  : user.role ===
                                    'content_creator'
                                  ? 'users-role-creator'
                                  : ''
                              }`}
                            >
                              {formatRole(
                                user.role
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="users-phone">
                              {user.phone ||
                                '—'}
                            </span>
                          </td>

                          <td>
                            <span className="users-id">
                              #{user.id}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="users-delete-button"
                              disabled={
                                isCurrentUser ||
                                isAdministrator ||
                                isDeleting
                              }
                              title={
                                isCurrentUser
                                  ? 'You cannot delete your own account'
                                  : isAdministrator
                                  ? 'The Administrator account cannot be deleted'
                                  : 'Delete user'
                              }
                              onClick={() =>
                                handleDelete(
                                  user
                                )
                              }
                            >
                              {isDeleting
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* =============================================
                MOBILE CARDS
            ============================================= */}

            <div className="users-mobile-list">
              {filteredUsers.map(
                (user) => {
                  const isCurrentUser =
                    currentUser?.id ===
                    user.id;

                  const isAdministrator =
                    user.role ===
                    'administrator';

                  const isDeleting =
                    deletingUserId ===
                    user.id;

                  return (
                    <div
                      className="users-mobile-card"
                      key={user.id}
                    >
                      <div className="users-mobile-top">
                        <div>
                          <div className="users-mobile-name">
                            {user.full_name ||
                              user.username}
                          </div>

                          <div className="users-mobile-username">
                            @{user.username}
                          </div>
                        </div>

                        <span
                          className={`users-role ${
                            user.role ===
                            'administrator'
                              ? 'users-role-admin'
                              : user.role ===
                                'marketing_team'
                              ? 'users-role-marketing'
                              : user.role ===
                                'business_user'
                              ? 'users-role-business'
                              : user.role ===
                                'content_creator'
                              ? 'users-role-creator'
                              : ''
                          }`}
                        >
                          {formatRole(
                            user.role
                          )}
                        </span>
                      </div>

                      <div className="users-mobile-row">
                        <span className="users-mobile-label">
                          Email
                        </span>

                        <span className="users-mobile-value">
                          {user.email}
                        </span>
                      </div>

                      <div className="users-mobile-row">
                        <span className="users-mobile-label">
                          Phone
                        </span>

                        <span className="users-mobile-value">
                          {user.phone ||
                            '—'}
                        </span>
                      </div>

                      <div className="users-mobile-row">
                        <span className="users-mobile-label">
                          ID
                        </span>

                        <span className="users-mobile-value">
                          #{user.id}
                        </span>
                      </div>

                      <div
                        className="users-mobile-row"
                        style={{
                          marginTop:
                            '8px',
                        }}
                      >
                        <span />

                        <button
                          type="button"
                          className="users-delete-button"
                          disabled={
                            isCurrentUser ||
                            isAdministrator ||
                            isDeleting
                          }
                          onClick={() =>
                            handleDelete(
                              user
                            )
                          }
                        >
                          {isDeleting
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default UsersPage;