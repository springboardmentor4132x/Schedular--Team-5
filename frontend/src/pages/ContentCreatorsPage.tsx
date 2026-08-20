import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Users,
  Mail,
  UserCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { userService } from '../services/api';

/* =========================================================
   TYPES
========================================================= */

type UserRole =
  | 'administrator'
  | 'marketing_team'
  | 'content_creator'
  | 'business_user';

type ContentCreator = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
};

/* =========================================================
   PAGE
========================================================= */

export function ContentCreatorsPage() {
  const [contentCreators, setContentCreators] = useState<
    ContentCreator[]
  >([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  /* =======================================================
     LOAD CONTENT CREATORS
     
     We intentionally use getAll() here because the
     Administrator dashboard already uses this endpoint
     successfully and receives all 13 users.

     We then filter the users to only:
     role === "content_creator"
  ======================================================= */

  const loadContentCreators = async (
    showRefreshing = false
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response =
        await userService.getAll();

      const data = response?.data;

      if (Array.isArray(data)) {
        const creators = data.filter(
          (user: any) =>
            String(user?.role || '')
              .toLowerCase()
              .trim() === 'content_creator'
        );

        setContentCreators(creators);
      } else {
        setContentCreators([]);
      }
    } catch (err: any) {
      console.error(
        'Failed to load content creators:',
        err
      );

      setContentCreators([]);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Unable to load content creators.';

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadContentCreators();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredCreators = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return contentCreators;
    }

    return contentCreators.filter(
      (creator) => {
        return (
          creator.username
            ?.toLowerCase()
            .includes(search) ||
          creator.email
            ?.toLowerCase()
            .includes(search) ||
          creator.full_name
            ?.toLowerCase()
            .includes(search) ||
          String(creator.id).includes(search)
        );
      }
    );
  }, [
    contentCreators,
    searchTerm,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Creators
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all registered content creators.
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px] bg-white rounded-2xl border border-gray-200">

          <div className="text-center">

            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

            <p className="mt-4 text-sm text-gray-500">
              Loading content creators...
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Content Creators
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all registered content creators.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            loadContentCreators(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >

          <RefreshCw
            className={`w-4 h-4 ${
              refreshing
                ? 'animate-spin'
                : ''
            }`}
          />

          Refresh

        </button>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Total Content Creators
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {contentCreators.length}
              </p>

            </div>

            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">

              <Users className="w-5 h-5 text-indigo-600" />

            </div>

          </div>

        </div>


        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Showing
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {filteredCreators.length}
              </p>

            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">

              <Search className="w-5 h-5 text-emerald-600" />

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-start gap-3">

            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />

            <div>

              <p className="text-sm font-semibold text-red-800">
                Unable to load content creators
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadContentCreators()
                }
                className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          CONTENT CREATORS CARD
      ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        {/* =================================================
            CARD HEADER
        ================================================= */}

        <div className="p-5 border-b border-gray-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Content Creator Members
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Users registered with the content creator role.
              </p>

            </div>


            {/* SEARCH */}

            <div className="relative w-full lg:w-80">

              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search content creators..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
              />

            </div>

          </div>

        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {contentCreators.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">

              <Users className="w-7 h-7 text-gray-400" />

            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No content creators found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are currently no registered content creators.
            </p>

          </div>

        ) : filteredCreators.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">

              <Search className="w-7 h-7 text-gray-400" />

            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No matching content creators
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try searching with a different username, name, or email.
            </p>

            <button
              type="button"
              onClick={() =>
                setSearchTerm('')
              }
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear search
            </button>

          </div>

        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-200 bg-gray-50/70">

                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Content Creator
                  </th>

                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>

                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>

                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account ID
                  </th>

                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredCreators.map(
                  (creator) => (

                    <tr
                      key={creator.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >

                      {/* CREATOR */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">

                            <UserCircle className="w-5 h-5 text-indigo-600" />

                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {creator.full_name ||
                                creator.username}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500 truncate">
                              @{creator.username}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />

                          <span className="text-sm text-gray-600">
                            {creator.email}
                          </span>

                        </div>

                      </td>


                      {/* ROLE */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                          Content Creator
                        </span>

                      </td>


                      {/* ID */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-gray-600">
                          #{creator.id}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">

                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                          Active

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default ContentCreatorsPage;