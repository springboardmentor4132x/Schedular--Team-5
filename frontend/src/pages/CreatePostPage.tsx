import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Video, FileText, Calendar, Clock, Hash,
  Bold, Italic, List, Link2, Smile, X, Upload, Send, Save,
  Check, AlertCircle,
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import { socialAccounts, campaigns } from '../data/mockData';
import { getPlatformConfig, formatDateTime, cn } from '../utils/helpers';

const availablePlatforms = ['facebook', 'instagram', 'twitter', 'linkedin'];

export function CreatePostPage() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [media, setMedia] = useState<{ type: 'image' | 'video'; url: string; name: string }[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [campaign, setCampaign] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const suggestions = [
  "🚀 Boost your brand with our latest update!",
  "✨ Stay connected for exciting news.",
  "🔥 Don't miss today's special offer!",
];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxLength = 280;
  const remaining = maxLength - content.length;
  const connectedAccounts = socialAccounts.filter((a) => a.status === 'connected' && availablePlatforms.includes(a.platform));

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) return;
      const url = URL.createObjectURL(file);
      setMedia((prev) => [...prev, { type: isImage ? 'image' : 'video', url, name: file.name }]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeMedia = (idx: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublish = () => {
    setError('');
    if (!content.trim()) { setError('Please write some content for your post.'); return; }
    if (selectedPlatforms.length === 0) { setError('Select at least one platform.'); return; }
    if (!saveAsDraft && (!scheduleDate || !scheduleTime)) { setError('Please set a schedule date and time.'); return; }

    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setContent('');
        setMedia([]);
        setScheduleDate('');
        setScheduleTime('');
        setCampaign('');
      }, 2000);
    }, 1500);
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Post</h1>
        <p className="text-sm text-gray-500 mt-1">Compose and schedule content across your social platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Platforms */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Platforms</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availablePlatforms.map((platform) => {
                const config = getPlatformConfig(platform);
                const Icon = config.icon;
                const isSelected = selectedPlatforms.includes(platform);
                const isConnected = connectedAccounts.some((a) => a.platform === platform);
                return (
                  <button
                    key={platform}
                    onClick={() => isConnected && togglePlatform(platform)}
                    disabled={!isConnected}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300',
                      !isConnected && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: config.color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{config.name}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Content editor */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Post Content</h3>
              <span className={cn('text-xs font-medium', remaining < 0 ? 'text-red-500' : remaining < 50 ? 'text-amber-500' : 'text-gray-400')}>
                {remaining} characters
              </span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 mb-2 p-1.5 bg-gray-50 rounded-xl">
              {[Bold, Italic, List, Link2, Smile].map((Icon, i) => (
                <button
                  key={i}
                  className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
                  onClick={() => i === 4 && insertEmoji('😊')}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertEmoji('#')}
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
              >
                <Hash className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Write your post content here..."
              rows={6}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            {/* Media upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            {media.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <AnimatePresence>
                  {media.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                    >
                      {m.type === 'image' ? (
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'mt-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">Images and videos up to 50MB</p>
              </div>
            )}
          </Card>

          {/* Schedule */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Schedule & Campaign</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign (optional)</label>
              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">No campaign</option>
                {campaigns.filter((c) => c.status === 'active').map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <button
                type="button"
                onClick={() => setSaveAsDraft(!saveAsDraft)}
                className={cn('w-4 h-4 rounded border transition-all flex items-center justify-center', saveAsDraft ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white')}
              >
                {saveAsDraft && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-sm text-gray-600">Save as draft (don't schedule)</span>
            </label>
          </Card>
<Card className="p-5">
  <h3 className="text-sm font-semibold mb-3">
    AI Caption Suggestions
  </h3>

  <div className="space-y-2">
    {suggestions.map((text, index) => (
      <button
        key={index}
        onClick={() => setContent(text)}
        className="w-full text-left border rounded-lg p-3 hover:bg-indigo-50 transition"
      >
        {text}
      </button>
    ))}
  </div>
</Card>
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth icon={<Save className="w-4 h-4" />} onClick={handlePublish} loading={publishing && saveAsDraft}>
              Save Draft
            </Button>
            <Button fullWidth icon={<Send className="w-4 h-4" />} onClick={handlePublish} loading={publishing && !saveAsDraft}>
              {saveAsDraft ? 'Save Draft' : 'Schedule Post'}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card className="p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Live Preview</h3>

            {/* Platform tabs */}
            {selectedPlatforms.length > 0 ? (
              <div className="space-y-4">
                {selectedPlatforms.map((platform) => {
                  const config = getPlatformConfig(platform);
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={platform}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        <span className="text-xs font-medium text-gray-600">{config.name}</span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                            SP
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">SocialPilot</p>
                            <p className="text-[10px] text-gray-400">Sponsored</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                          {content || 'Your post content will appear here...'}
                        </p>
                        {media.length > 0 && (
                          <div className={cn('rounded-lg overflow-hidden', media.length > 1 && 'grid grid-cols-2 gap-1')}>
                            {media.slice(0, 4).map((m, idx) => (
                              <div key={idx} className={cn('bg-gray-100', media.length === 1 ? 'aspect-video' : 'aspect-square')}>
                                {m.type === 'image' ? (
                                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                    <Video className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Select a platform to preview</p>
              </div>
            )}

            {/* Schedule summary */}
            {scheduleDate && scheduleTime && !saveAsDraft && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  Scheduled for {formatDateTime(`${scheduleDate}T${scheduleTime}`)}
                </div>
              </div>
            )}
          </Card>

          {/* Success animation */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl"
              >
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">Post {saveAsDraft ? 'saved' : 'scheduled'} successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
