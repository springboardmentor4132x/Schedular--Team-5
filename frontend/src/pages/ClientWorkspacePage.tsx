import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  RefreshCw,
  UserCircle,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  businessAssignmentService,
  campaignService,
} from '../services/api';

interface Client {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
}

interface Campaign {
  id: number;
  user_id: number;
  title: string;
  description: string;
  platform: string | null;
  budget: number | null;
  objectives: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
}

export function ClientWorkspacePage() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [client, setClient] =
    useState<Client | null>(null);

  const [campaigns, setCampaigns] =
    useState<Campaign[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [campaignsLoading, setCampaignsLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [campaignsError, setCampaignsError] =
    useState('');

  const loadClientWorkspace = async () => {
    if (!clientId) {
      setError('Client ID is missing.');
      setLoading(false);
      setCampaignsLoading(false);
      return;
    }

    try {
      setLoading(true);
      setCampaignsLoading(true);

      setError('');
      setCampaignsError('');

      const numericClientId =
        Number(clientId);

      const [
        clientResponse,
        campaignsResponse,
      ] = await Promise.all([
        businessAssignmentService.getClientDetails(
          numericClientId
        ),
        campaignService.getClientCampaigns(
          numericClientId
        ),
      ]);

      setClient(
        clientResponse.data
      );

      setCampaigns(
        campaignsResponse.data
      );
    } catch (err: any) {
      console.error(
        'Unable to load client workspace:',
        err
      );

      const detail =
        err.response?.data?.detail ||
        'Unable to load client workspace.';

      if (
        err.config?.url?.includes(
          '/campaigns/client/'
        )
      ) {
        setCampaignsError(
          detail
        );
      } else {
        setError(
          detail
        );
      }
    } finally {
      setLoading(false);
      setCampaignsLoading(false);
    }
  };

  useEffect(() => {
    loadClientWorkspace();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />

          <p className="mt-4 text-sm text-gray-500">
            Loading client workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            navigate('/app/clients')
          }
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Clients
        </button>

        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() =>
            navigate('/app/clients')
          }
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Clients
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <UserCircle className="w-12 h-12 mx-auto text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Client not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            The requested client could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            navigate('/app/clients')
          }
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Clients
        </button>

        <button
          type="button"
          onClick={loadClientWorkspace}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>


      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Client Workspace
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage campaigns, posts, scheduling,
          publishing, and analytics for this client.
        </p>
      </div>


      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <UserCircle className="w-9 h-9 text-indigo-600" />
          </div>

          <div className="min-w-0">

            <h2 className="text-xl font-semibold text-gray-900">
              {client.full_name ||
                client.username}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              @{client.username}
            </p>

          </div>

        </div>


        <div className="mt-6 pt-5 border-t border-gray-100">

          <div className="flex items-center gap-3">

            <Mail className="w-5 h-5 text-gray-400" />

            <div>

              <p className="text-xs text-gray-400">
                Email
              </p>

              <p className="text-sm font-medium text-gray-700">
                {client.email}
              </p>

            </div>

          </div>

        </div>

      </div>


      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Campaigns
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Campaigns created for this client.
            </p>

          </div>

          <span className="text-sm font-medium text-indigo-600">
            {campaigns.length}
          </span>

        </div>


        {campaignsLoading && (
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        )}


        {!campaignsLoading &&
          campaignsError && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {campaignsError}
            </div>
          )}


        {!campaignsLoading &&
          !campaignsError &&
          campaigns.length === 0 && (
            <div className="mt-5 border border-dashed border-gray-200 rounded-xl p-8 text-center">

              <CalendarDays className="w-10 h-10 mx-auto text-gray-400" />

              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                No campaigns yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                This client does not have any campaigns yet.
              </p>

            </div>
          )}


        {!campaignsLoading &&
          !campaignsError &&
          campaigns.length > 0 && (
            <div className="mt-5 space-y-3">

              {campaigns.map(
                (campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h3 className="font-semibold text-gray-900">
                          {campaign.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {campaign.description}
                        </p>

                      </div>

                      <span className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
                        {campaign.status}
                      </span>

                    </div>


                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">

                      <div>
                        <p className="text-xs text-gray-400">
                          Platform
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                          {campaign.platform ||
                            'Not specified'}
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-gray-400">
                          Start Date
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                          {new Date(
                            campaign.start_date
                          ).toLocaleDateString()}
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-gray-400">
                          End Date
                        </p>

                        <p className="mt-1 font-medium text-gray-700">
                          {campaign.end_date
                            ? new Date(
                                campaign.end_date
                              ).toLocaleDateString()
                            : 'No end date'}
                        </p>
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

          <h3 className="text-base font-semibold text-gray-900">
            Posts
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Client posts will appear here.
          </p>

        </div>


        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

          <h3 className="text-base font-semibold text-gray-900">
            Analytics
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Client analytics will appear here.
          </p>

        </div>

      </div>

    </div>
  );
}