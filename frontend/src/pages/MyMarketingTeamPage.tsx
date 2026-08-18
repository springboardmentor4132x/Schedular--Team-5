import { useEffect, useState } from 'react';
import {
  Users,
  UserCircle,
  Mail,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

import { businessAssignmentService } from '../services/api';

interface MarketingTeam {
  id: number;
  username: string;
  email: string;
}

export function MyMarketingTeamPage() {
  const [marketingTeams, setMarketingTeams] = useState<
    MarketingTeam[]
  >([]);

  const [assignedTeam, setAssignedTeam] =
    useState<MarketingTeam | null>(null);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedTeamId, setSelectedTeamId] =
    useState<number | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        teamsResponse,
        assignmentResponse,
      ] = await Promise.all([
        businessAssignmentService.getMarketingTeams(),
        businessAssignmentService.getMyAssignment(),
      ]);

      setMarketingTeams(teamsResponse.data);

      if (
        assignmentResponse.data.assigned &&
        assignmentResponse.data.marketing_team
      ) {
        setAssignedTeam(
          assignmentResponse.data.marketing_team
        );

        setSelectedTeamId(
          assignmentResponse.data.marketing_team.id
        );
      } else {
        setAssignedTeam(null);
        setSelectedTeamId(null);
      }
    } catch (err: any) {
      console.error(
        'Unable to load marketing teams:',
        err
      );

      setError(
        err.response?.data?.detail ||
          'Unable to load marketing teams.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async () => {
    if (!selectedTeamId) {
      setError(
        'Please select a Marketing Team first.'
      );
      return;
    }

    try {
      setAssigning(true);
      setError('');
      setSuccess('');

      await businessAssignmentService.assignMarketingTeam(
        selectedTeamId
      );

      const assignmentResponse =
        await businessAssignmentService.getMyAssignment();

      setAssignedTeam(
        assignmentResponse.data.marketing_team
      );

      setSuccess(
        'Marketing Team assigned successfully.'
      );
    } catch (err: any) {
      console.error(
        'Unable to assign marketing team:',
        err
      );

      setError(
        err.response?.data?.detail ||
          'Unable to assign Marketing Team.'
      );
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Marketing Team
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Select the Marketing Team that will manage
          your social media campaigns.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {loading ? (

        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>

      ) : (

        <>

          {assignedTeam && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">

              <div className="flex items-center gap-3">

                <CheckCircle className="w-6 h-6 text-indigo-600" />

                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    Your Current Marketing Team
                  </p>

                  <p className="text-sm text-indigo-700 mt-1">
                    {assignedTeam.username}
                  </p>
                </div>

              </div>

            </div>
          )}

          <div>

            <div className="flex items-center gap-2 mb-4">

              <Users className="w-5 h-5 text-indigo-600" />

              <h2 className="text-lg font-semibold text-gray-900">
                Available Marketing Teams
              </h2>

            </div>

            {marketingTeams.length === 0 ? (

              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">

                <Users className="w-10 h-10 mx-auto text-gray-400" />

                <h3 className="mt-4 font-semibold text-gray-900">
                  No Marketing Teams Available
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  There are currently no Marketing Teams
                  available for assignment.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {marketingTeams.map(
                  (team) => {

                    const isSelected =
                      selectedTeamId === team.id;

                    return (
                      <button
                        key={team.id}
                        onClick={() =>
                          setSelectedTeamId(
                            team.id
                          )
                        }
                        className={`text-left bg-white border rounded-2xl p-5 transition-all ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-100'
                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                        }`}
                      >

                        <div className="flex items-center gap-4">

                          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">

                            <UserCircle className="w-7 h-7 text-indigo-600" />

                          </div>

                          <div className="min-w-0">

                            <h3 className="font-semibold text-gray-900 truncate">

                              {team.username}

                            </h3>

                            <div className="flex items-center gap-2 mt-1">

                              <Mail className="w-4 h-4 text-gray-400" />

                              <p className="text-sm text-gray-500 truncate">

                                {team.email}

                              </p>

                            </div>

                          </div>

                        </div>

                        <div className="mt-5">

                          {isSelected ? (

                            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">

                              <CheckCircle className="w-4 h-4" />

                              Selected

                            </div>

                          ) : (

                            <div className="text-sm text-gray-500">

                              Click to select

                            </div>

                          )}

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            )}

          </div>

          {marketingTeams.length > 0 && (

            <div className="flex justify-end">

              <button
                onClick={handleAssign}
                disabled={
                  assigning ||
                  !selectedTeamId
                }
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >

                {assigning && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}

                {assigning
                  ? 'Assigning...'
                  : 'Assign Marketing Team'}

              </button>

            </div>

          )}

        </>

      )}

    </div>
  );
}