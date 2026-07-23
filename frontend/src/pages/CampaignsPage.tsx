import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Megaphone, Calendar, DollarSign, Target, Users,
  MoreVertical, Edit2, Trash2, Eye, X, Check,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Input, EmptyState } from '../components/ui';
import { campaigns as initialCampaigns } from '../data/mockData';
import { formatCurrency, formatNumber, formatDate, getPlatformConfig, cn } from '../utils/helpers';

const statusVariants: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  draft: 'default',
  completed: 'info',
  paused: 'warning',
};

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', budget: '', startDate: '', endDate: '', objective: 'Brand Awareness',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  const handleCreate = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = 'Name is required';
    if (!form.budget) e.budget = 'Budget is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const newCampaign = {
      id: Date.now().toString(),
      name: form.name,
      description: form.description || 'No description provided',
      platforms: ['facebook', 'instagram'],
      startDate: form.startDate,
      endDate: form.endDate,
      budget: parseInt(form.budget),
      spent: 0,
      status: 'active' as const,
      posts: 0,
      reach: 0,
      engagement: 0,
      objective: form.objective,
      color: '#3B82F6',
    };
    setCampaigns([newCampaign, ...campaigns]);
    setShowCreate(false);
    setForm({ name: '', description: '', budget: '', startDate: '', endDate: '', objective: 'Brand Awareness' });
  };

  const handleDelete = () => {
    setCampaigns(campaigns.filter((c) => c.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const filters = [
    { key: 'all', label: 'All Campaigns', count: campaigns.length },
    { key: 'active', label: 'Active', count: campaigns.filter((c) => c.status === 'active').length },
    { key: 'draft', label: 'Drafts', count: campaigns.filter((c) => c.status === 'draft').length },
    { key: 'completed', label: 'Completed', count: campaigns.filter((c) => c.status === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your marketing campaigns</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>New Campaign</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Campaigns', value: campaigns.length, icon: Megaphone, color: 'from-indigo-500 to-violet-500' },
          { label: 'Active Now', value: campaigns.filter((c) => c.status === 'active').length, icon: Target, color: 'from-emerald-500 to-teal-500' },
          { label: 'Total Budget', value: formatCurrency(campaigns.reduce((s, c) => s + c.budget, 0)), icon: DollarSign, color: 'from-amber-500 to-orange-500' },
          { label: 'Total Reach', value: formatNumber(campaigns.reduce((s, c) => s + c.reach, 0)), icon: Users, color: 'from-blue-500 to-cyan-500' },
        ].map((stat, idx) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="p-5">
              <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', stat.color)}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            )}
          >
            {f.label}
            <span className={cn('px-1.5 py-0.5 text-xs rounded-md', filter === f.key ? 'bg-white/20' : 'bg-gray-100')}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Campaign grid */}
      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Megaphone className="w-8 h-8" />}
            title="No campaigns found"
            description="Create your first campaign to start tracking your marketing performance."
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>New Campaign</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((campaign, idx) => {
              const progress = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0;
              return (
                <motion.div
                  key={campaign.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card hover className="p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: campaign.color }} />
                        <Badge variant={statusVariants[campaign.status]} dot>{campaign.status}</Badge>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === campaign.id ? null : campaign.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        <AnimatePresence>
                          {menuOpen === campaign.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10"
                            >
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Eye className="w-4 h-4 text-gray-400" /> View
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit2 className="w-4 h-4 text-gray-400" /> Edit
                              </button>
                              <button
                                onClick={() => { setDeleteTarget(campaign.id); setMenuOpen(null); }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{campaign.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      {campaign.platforms.map((p) => {
                        const config = getPlatformConfig(p);
                        const Icon = config.icon;
                        return (
                          <div key={p} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Reach</p>
                        <p className="text-sm font-semibold text-gray-900">{formatNumber(campaign.reach)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Engagement</p>
                        <p className="text-sm font-semibold text-emerald-600">{campaign.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Posts</p>
                        <p className="text-sm font-semibold text-gray-900">{campaign.posts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Objective</p>
                        <p className="text-sm font-semibold text-gray-900">{campaign.objective}</p>
                      </div>
                    </div>

                    {/* Budget progress */}
                    <div className="mt-auto">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Budget</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: campaign.color }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                        </div>
                        <span className="text-xs font-medium text-gray-600">{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create campaign modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Campaign" size="lg">
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="e.g. Summer Launch 2026"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              placeholder="Describe your campaign goals..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Budget ($)"
              type="number"
              placeholder="10000"
              icon={<DollarSign className="w-4 h-4" />}
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              error={errors.budget}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Objective</label>
              <select
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {['Brand Awareness', 'Conversions', 'Engagement', 'Trust Building', 'Sales', 'Lead Generation'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <Input
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              error={errors.startDate}
            />
            <Input
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              error={errors.endDate}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button fullWidth icon={<Check className="w-4 h-4" />} onClick={handleCreate}>Create Campaign</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Campaign?" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          This will permanently delete the campaign and all its data. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleDelete} icon={<X className="w-4 h-4" />}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
