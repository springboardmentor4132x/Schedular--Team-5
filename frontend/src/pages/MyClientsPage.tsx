import { useEffect, useState } from 'react';
import {
  Users,
  Mail,
  RefreshCw,
  UserCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { businessAssignmentService } from '../services/api';

interface Client {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
}

export function MyClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await businessAssignmentService.getMyClients();

      setClients(response.data);
    } catch (err: any) {
      console.error(
        'Unable to load clients:',
        err
      );

      setError(
        err.response?.data?.detail ||
        'Unable to load your clients.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Clients
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            View the business users assigned to your
            marketing team.
          </p>
        </div>

        <button
          onClick={loadClients}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? 'animate-spin' : ''
            }`}
          />

          Refresh
        </button>

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (

        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>

      ) : clients.length === 0 ? (

        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No clients assigned
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You currently don't have any business users
            assigned to your marketing team.
          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {clients.map((client) => (

            <div
              key={client.id}
              onClick={() =>
                navigate(`/app/clients/${client.id}`)
              }
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-indigo-400 cursor-pointer transition-all"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-indigo-600" />
                </div>

                <div className="min-w-0">

                  <h3 className="font-semibold text-gray-900 truncate">
                    {client.full_name ||
                      client.username}
                  </h3>

                  <p className="text-sm text-gray-500 truncate">
                    @{client.username}
                  </p>

                </div>

              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">

                <div className="flex items-center gap-2 text-sm text-gray-600">

                  <Mail className="w-4 h-4 text-gray-400" />

                  <span className="truncate">
                    {client.email}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}