import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Megaphone,
  Calendar,
  DollarSign,
  Target,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
} from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  Modal,
  Input,
  EmptyState,
} from '../components/ui';
import { campaignService } from '../services/api';
import {
  formatCurrency,
  formatDate,
  getPlatformConfig,
  cn,
} from '../utils/helpers';

type Campaign = {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  platform: string;
  budget: number;
  objectives?: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

type CampaignForm = {
  title: string;
  description: string;
  platform: string;
  budget: string;
  objectives: string;
  start_date: string;
  end_date: string;
  status: string;
};

const emptyForm: CampaignForm = {
  title: '',
  description: '',
  platform: 'facebook',
  budget: '',
  objectives: '',
  start_date: '',
  end_date: '',
  status: 'draft',
};

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<Campaign | null>(null);
  const [viewingCampaign, setViewingCampaign] =
    useState<Campaign | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState<CampaignForm>(emptyForm);

  const loadCampaigns = async () => {
    try {
      setLoading(true);

      const response = await campaignService.getAll();

      setCampaigns(response.data || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCampaign(null);
    setShowCreateModal(true);
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);

    setForm({
      title: campaign.title || '',
      description: campaign.description || '',
      platform: campaign.platform || 'facebook',
      budget: String(campaign.budget ?? ''),
      objectives: campaign.objectives || '',
      start_date: campaign.start_date
        ? campaign.start_date.slice(0, 16)
        : '',
      end_date: campaign.end_date
        ? campaign.end_date.slice(0, 16)
        : '',
      status: campaign.status || 'draft',
    });

    setShowCreateModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowCreateModal(false);
    setEditingCampaign(null);
    resetForm();
  };

  const handleFormChange = (
    field: keyof CampaignForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('Please enter a campaign title.');
      return;
    }

    if (!form.budget) {
      alert('Please enter a campaign budget.');
      return;
    }

    if (!form.start_date || !form.end_date) {
      alert('Please select start and end dates.');
      return;
    }

    try {
      setSaving(true);

      const campaignData = {
        title: form.title.trim(),
        description: form.description.trim(),
        platform: form.platform,
        budget: Number(form.budget),
        objectives: form.objectives.trim(),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        status: form.status,
      };

      if (editingCampaign) {
        await campaignService.update(
          editingCampaign.id,
          campaignData
        );
      } else {
        await campaignService.create(campaignData);
      }

      await loadCampaigns();

      closeModal();
    } catch (error: any) {
      console.error('Failed to save campaign:', error);

      const message =
        error?.response?.data?.detail ||
        'Failed to save campaign. Please try again.';

      alert(
        typeof message === 'string'
          ? message
          : 'Failed to save campaign. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this campaign?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await campaignService.delete(id);

      setCampaigns((previous) =>
        previous.filter((campaign) => campaign.id !== id)
      );
    } catch (error: any) {
      console.error('Failed to delete campaign:', error);

      const message =
        error?.response?.data?.detail ||
        'Failed to delete campaign. Please try again.';

      alert(
        typeof message === 'string'
          ? message
          : 'Failed to delete campaign. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeTab === 'all') {
      return true;
    }

    return campaign.status === activeTab;
  });

  const totalBudget = campaigns.reduce(
    (total, campaign) => total + Number(campaign.budget || 0),
    0
  );

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === 'active'
  ).length;

  const draftCampaigns = campaigns.filter(
    (campaign) => campaign.status === 'draft'
  ).length;

  const completedCampaigns = campaigns.filter(
    (campaign) => campaign.status === 'completed'
  ).length;

  const getStatusVariant = (
    status: string
  ): 'success' | 'warning' | 'info' | 'danger' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      case 'youtube':
        return 'YouTube';
      case 'twitter':
        return 'X';
      case 'pinterest':
        return 'Pinterest';
      default:
        return platform;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Campaigns
          </h1>

          <p className="text-gray-500 mt-1">
            Create and manage your marketing campaigns
          </p>
        </div>

        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-indigo-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Campaigns
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Active Now
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {activeCampaigns}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Budget
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Draft Campaigns
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {draftCampaigns}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          {
            key: 'all',
            label: 'All Campaigns',
            count: campaigns.length,
          },
          {
            key: 'active',
            label: 'Active',
            count: activeCampaigns,
          },
          {
            key: 'draft',
            label: 'Drafts',
            count: draftCampaigns,
          },
          {
            key: 'completed',
            label: 'Completed',
            count: completedCampaigns,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {tab.label}

            <span
              className={cn(
                'ml-2 px-1.5 py-0.5 rounded-md text-xs',
                activeTab === tab.key
                  ? 'bg-white/20'
                  : 'bg-gray-100'
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <Card>
          <div className="py-12 text-center">
            <p className="text-gray-500">
              Loading campaigns...
            </p>
          </div>
        </Card>
      ) : filteredCampaigns.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Megaphone className="w-8 h-8" />}
            title="No campaigns found"
            description="Create your first campaign to start managing your marketing activities."
            action={
              <Button
                icon={<Plus className="w-4 h-4" />}
                onClick={openCreateModal}
              >
                New Campaign
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredCampaigns.map((campaign) => {
              const platformConfig = getPlatformConfig(
                campaign.platform
              );

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                >
                  <Card className="h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `${platformConfig.color}15`,
                          }}
                        >
                          <Megaphone
                            className="w-5 h-5"
                            style={{
                              color: platformConfig.color,
                            }}
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {campaign.title}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            Campaign #{campaign.id}
                          </p>
                        </div>
                      </div>

                      <div className="relative group">
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 hidden group-hover:block z-10">
                          <button
                            onClick={() =>
                              setViewingCampaign(campaign)
                            }
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>

                          <button
                            onClick={() =>
                              openEditModal(campaign)
                            }
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(campaign.id)
                            }
                            disabled={
                              deletingId === campaign.id
                            }
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingId === campaign.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Badge
                        variant={getStatusVariant(
                          campaign.status
                        )}
                      >
                        {campaign.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500 mt-3 min-h-[40px]">
                      {campaign.description ||
                        'No campaign description provided.'}
                    </p>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Platform
                        </p>

                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {getPlatformLabel(
                            campaign.platform
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Objective
                        </p>

                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {campaign.objectives ||
                            'No objective specified'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">
                            Budget
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {formatCurrency(
                              Number(campaign.budget || 0)
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Duration
                          </p>

                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {formatDate(
                              campaign.start_date
                            )}{' '}
                            -{' '}
                            {formatDate(
                              campaign.end_date
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() =>
                          setViewingCampaign(campaign)
                        }
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          openEditModal(campaign)
                        }
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={showCreateModal}
        onClose={closeModal}
        title={
          editingCampaign
            ? 'Edit Campaign'
            : 'Create New Campaign'
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Input
            label="Campaign Title"
            placeholder="Enter campaign title"
            value={form.title}
            onChange={(e) =>
              handleFormChange('title', e.target.value)
            }
            required
          />

          <Input
            label="Description"
            placeholder="Enter campaign description"
            value={form.description}
            onChange={(e) =>
              handleFormChange(
                'description',
                e.target.value
              )
            }
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>

            <select
              value={form.platform}
              onChange={(e) =>
                handleFormChange(
                  'platform',
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="facebook">
                Facebook
              </option>

              <option value="instagram">
                Instagram
              </option>

              <option value="linkedin">
                LinkedIn
              </option>

              <option value="youtube">
                YouTube
              </option>

              <option value="twitter">
                X
              </option>

              <option value="pinterest">
                Pinterest
              </option>
            </select>
          </div>

          <Input
            label="Budget"
            type="number"
            placeholder="Enter budget"
            value={form.budget}
            onChange={(e) =>
              handleFormChange(
                'budget',
                e.target.value
              )
            }
            required
          />

          <Input
            label="Objectives"
            placeholder="Enter campaign objectives"
            value={form.objectives}
            onChange={(e) =>
              handleFormChange(
                'objectives',
                e.target.value
              )
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="datetime-local"
              value={form.start_date}
              onChange={(e) =>
                handleFormChange(
                  'start_date',
                  e.target.value
                )
              }
              required
            />

            <Input
              label="End Date"
              type="datetime-local"
              value={form.end_date}
              onChange={(e) =>
                handleFormChange(
                  'end_date',
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                handleFormChange(
                  'status',
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">
                Completed
              </option>
              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={saving}
              icon={
                !saving ? (
                  <Check className="w-4 h-4" />
                ) : undefined
              }
            >
              {editingCampaign
                ? 'Update Campaign'
                : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!viewingCampaign}
        onClose={() => setViewingCampaign(null)}
        title="Campaign Details"
      >
        {viewingCampaign && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-500">
                Campaign Title
              </p>

              <p className="text-lg font-semibold text-gray-900 mt-1">
                {viewingCampaign.title}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Description
              </p>

              <p className="text-sm text-gray-700 mt-1">
                {viewingCampaign.description ||
                  'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">
                  Platform
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {getPlatformLabel(
                    viewingCampaign.platform
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <div className="mt-1">
                  <Badge
                    variant={getStatusVariant(
                      viewingCampaign.status
                    )}
                  >
                    {viewingCampaign.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Budget
              </p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatCurrency(
                  Number(viewingCampaign.budget || 0)
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Objectives
              </p>

              <p className="text-sm text-gray-700 mt-1">
                {viewingCampaign.objectives ||
                  'No objectives specified.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">
                  Start Date
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(
                    viewingCampaign.start_date
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  End Date
                </p>

                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(
                    viewingCampaign.end_date
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() =>
                  setViewingCampaign(null)
                }
              >
                Close
              </Button>

              <Button
                icon={<Edit2 className="w-4 h-4" />}
                onClick={() => {
                  const campaign =
                    viewingCampaign;

                  setViewingCampaign(null);
                  openEditModal(campaign);
                }}
              >
                Edit Campaign
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}