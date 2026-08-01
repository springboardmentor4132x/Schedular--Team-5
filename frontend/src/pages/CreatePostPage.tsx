import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Calendar,
  Clock,
  Hash,
  Bold,
  Italic,
  List,
  Link2,
  Smile,
  X,
  Upload,
  Send,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

import { Card, Button } from '../components/ui';
import { getPlatformConfig, cn } from '../utils/helpers';

const availablePlatforms = ['facebook', 'instagram', 'x', 'linkedin', 'youtube', 'pinterest'];

type MediaItem = {
  type: 'image' | 'video';
  url: string; // Object URL or local URL for preview
  name: string;
  uploadedUrl: string;
};

export function CreatePostPage() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram', 'linkedin']);
  const [media, setMedia] = useState<MediaItem | null>(null);
  
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [campaign, setCampaign] = useState('');
  const [isDraftMode, setIsDraftMode] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 280;
  const remaining = maxLength - content.length;

  // Cleanup Object URLs on Unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (media?.url) {
        URL.revokeObjectURL(media.url);
      }
    };
  }, [media]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((item) => item !== platform) : [...prev, platform]
    );
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; 
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError(`${file.name} is not a supported image or video file.`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError(`${file.name} is larger than 50MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    try {
      setError('');
      setUploading(true);
      
      if (media?.url) URL.revokeObjectURL(media.url);

      // Simulate local upload delay for frontend smoothness
      await new Promise((resolve) => setTimeout(resolve, 600));

      setMedia({
        type: isVideo ? 'video' : 'image',
        url: previewUrl,
        name: file.name,
        uploadedUrl: previewUrl,
      });
    } catch (err: any) {
      console.error('Media upload error:', err);
      URL.revokeObjectURL(previewUrl);
      setError(`Unable to upload ${file.name}.`);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    if (media?.url) {
      URL.revokeObjectURL(media.url);
    }
    setMedia(null);
  };

  const handlePostSubmission = async (overrideDraftMode?: boolean) => {
    setError('');
    setSuccess(false);

    const activeDraftMode = overrideDraftMode !== undefined ? overrideDraftMode : isDraftMode;

    if (!content.trim()) {
      setError('Please write some content for your post.');
      return;
    }

    if (content.length > maxLength) {
      setError(`Post content cannot exceed ${maxLength} characters.`);
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Select at least one platform.');
      return;
    }

    if (!activeDraftMode && (!scheduleDate || !scheduleTime)) {
      setError('Please set a schedule date and time.');
      return;
    }

    const newPostItem = {
      id: Date.now(),
      content: content.trim(),
      media_url: media?.uploadedUrl || null,
      media_type: media?.type || 'text',
      scheduled_time: activeDraftMode ? null : `${scheduleDate}T${scheduleTime}:00`,
      platforms: selectedPlatforms,
      campaign_id: campaign || null,
      save_as_draft: activeDraftMode,
      status: activeDraftMode ? 'Draft' : 'Scheduled',
      created_at: new Date().toISOString(),
    };

    try {
      setPublishing(true);

      // Save locally into localStorage so calendar/queue pages can access it
      const existingPosts = JSON.parse(localStorage.getItem('frontend_scheduled_posts') || '[]');
      localStorage.setItem('frontend_scheduled_posts', JSON.stringify([newPostItem, ...existingPosts]));

      await new Promise((resolve) => setTimeout(resolve, 500)); // smooth UI feedback

      setSuccess(true);
      if (media?.url) URL.revokeObjectURL(media.url);

      setContent('');
      setMedia(null);
      setScheduleDate('');
      setScheduleTime('');
      setCampaign('');
      setIsDraftMode(false);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Create post error:', err);
      setError('Unable to save the post. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Post</h1>
        <p className="text-sm text-gray-500 mt-1">Compose and schedule content across your social platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Platform Selector */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Platforms</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {availablePlatforms.map((platform) => {
                const config = getPlatformConfig(platform);
                const Icon = config.icon;
                const isSelected = selectedPlatforms.includes(platform);

                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: config.color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{config.name}</span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Editor Area */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Post Content</h3>
              <span className={cn('text-xs font-medium', remaining < 0 ? 'text-red-500' : remaining < 50 ? 'text-amber-500' : 'text-gray-400')}>
                {remaining} characters
              </span>
            </div>

            <div className="flex items-center gap-1 mb-2 p-1.5 bg-gray-50 rounded-xl">
              {[Bold, Italic, List, Link2, Smile].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
                  onClick={() => i === 4 && setContent((prev) => prev + '😊')}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setContent((prev) => prev + '#')} className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700">
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                handleFileSelect(e.target.files);
                e.target.value = '';
              }}
            />

            {uploading && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Upload className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="text-sm text-indigo-700">Uploading media...</span>
              </div>
            )}

            {media && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    {media.type === 'image' ? (
                      <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <button type="button" onClick={removeMedia} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">Uploaded</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {!media && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={cn(
                  'mt-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  uploading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">{uploading ? 'Uploading...' : 'Drag & drop or click to upload'}</p>
                <p className="text-xs text-gray-400 mt-1">Image or video file up to 50MB</p>
              </div>
            )}
          </Card>

          {/* Schedule Configuration */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Schedule & Campaign</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    disabled={isDraftMode}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time (IST)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    disabled={isDraftMode}
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign (optional)</label>
              <input
                type="text"
                placeholder="Enter campaign name..."
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setIsDraftMode(!isDraftMode)}
                className={cn(
                  'w-4 h-4 rounded border transition-all flex items-center justify-center',
                  isDraftMode ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                )}
              >
                {isDraftMode && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-sm text-gray-600">Save as draft (don't schedule)</span>
            </label>
          </Card>

          {/* Alert Handling */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                <Check className="w-4 h-4 flex-shrink-0" />
                Post processed successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions Footer */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              icon={<Save className="w-4 h-4" />}
              onClick={() => handlePostSubmission(true)}
              loading={publishing && isDraftMode}
              disabled={publishing || uploading}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              fullWidth
              icon={<Send className="w-4 h-4" />}
              onClick={() => handlePostSubmission(false)}
              loading={publishing && !isDraftMode}
              disabled={publishing || uploading}
            >
              {isDraftMode ? 'Confirm Draft' : 'Schedule Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}