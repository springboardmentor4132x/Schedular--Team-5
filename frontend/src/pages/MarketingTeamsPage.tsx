
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

type MarketingTeam = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  role: string;
  phone?: string | null;
  website?: string | null;
  bio?: string | null;
};

/* =========================================================
   PAGE
========================================================= */

export function MarketingTeamsPage() {
  const [marketingTeams, setMarketingTeams] = useState<
    MarketingTeam[]
  >([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  /* =======================================================
     LOAD MARKETING TEAMS
  ======================================================= */

  const loadMarketingTeams = async (
    showRefreshing = false
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      /*
       * Existing backend endpoint:
       *
       * GET /users/marketing
       */

      const response =
        await userService.getMarketingUsers();

      const data = response?.data;

      if (Array.isArray(data)) {
        setMarketingTeams(data);
      } else {
        setMarketingTeams([]);
      }
    } catch (err: any) {
      console.error(
        'Failed to load marketing teams:',
        err
      );

      setMarketingTeams([]);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Unable to load marketing teams.';

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
    loadMarketingTeams();
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredTeams = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    if (!search) {
      return marketingTeams;
    }

    return marketingTeams.filter(
      (team) => {
        return (
          team.username
            ?.toLowerCase()
            .includes(search) ||
          team.email
            ?.toLowerCase()
            .includes(search) ||
          team.full_name
            ?.toLowerCase()
            .includes(search) ||
          String(team.id).includes(search)
        );
      }
    );
  }, [
    marketingTeams,
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
            Marketing Teams
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all registered marketing team members.
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px] bg-white rounded-2xl border border-gray-200">

          <div className="text-center">

            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

            <p className="mt-4 text-sm text-gray-500">
              Loading marketing teams...
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
            Marketing Teams
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all registered marketing team members.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            loadMarketingTeams(true)
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
                Total Marketing Teams
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {marketingTeams.length}
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
                {filteredTeams.length}
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
                Unable to load marketing teams
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadMarketingTeams()
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
          MARKETING TEAMS CARD
      ================================================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        {/* =================================================
            CARD HEADER
        ================================================= */}

        <div className="p-5 border-b border-gray-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Marketing Team Members
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Users registered with the marketing team role.
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
                placeholder="Search marketing teams..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
              />

            </div>

          </div>

        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {marketingTeams.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">

              <Users className="w-7 h-7 text-gray-400" />

            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No marketing teams found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              There are currently no registered marketing team members.
            </p>

          </div>

        ) : filteredTeams.length === 0 ? (

          <div className="p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">

              <Search className="w-7 h-7 text-gray-400" />

            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No matching marketing teams
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
                    Marketing Team
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

                {filteredTeams.map(
                  (team) => (

                    <tr
                      key={team.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >

                      {/* TEAM */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">

                            <UserCircle className="w-5 h-5 text-indigo-600" />

                          </div>

                          <div className="min-w-0">

                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {team.full_name ||
                                team.username}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500 truncate">
                              @{team.username}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />

                          <span className="text-sm text-gray-600">
                            {team.email}
                          </span>

                        </div>

                      </td>


                      {/* ROLE */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                          Marketing Team
                        </span>

                      </td>


                      {/* ID */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-gray-600">
                          #{team.id}
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

export default MarketingTeamsPage;
