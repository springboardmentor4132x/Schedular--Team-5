import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  FileText,
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

import api, {
  postService,
  campaignService,
  accountService,
} from '../services/api';

import {
  getPlatformConfig,
  formatDateTime,
  cn,
} from '../utils/helpers';

const availablePlatforms = [
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
];

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  name: string;
  uploadedUrl: string;
};

export function CreatePostPage() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] =
    useState<string[]>([]);

  const [media, setMedia] = useState<MediaItem[]>([]);

  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const [campaign, setCampaign] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const maxLength = 280;
  const remaining =
    maxLength - content.length;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError('');

        const [
          accountsResponse,
          campaignsResponse,
        ] = await Promise.all([
          accountService.getAll(),
          campaignService.getAll(),
        ]);

        console.log(
          'Social accounts API response:',
          accountsResponse.data
        );

        console.log(
          'Campaigns API response:',
          campaignsResponse.data
        );

        const accountsData =
          Array.isArray(accountsResponse.data)
            ? accountsResponse.data
            : accountsResponse.data?.items || [];

        const campaignsData =
          Array.isArray(campaignsResponse.data)
            ? campaignsResponse.data
            : campaignsResponse.data?.items || [];

        setSocialAccounts(accountsData);
        setCampaigns(campaignsData);

        const connectedPlatforms =
          accountsData
            .filter((account: any) => {
              const platform = String(
                account.platform || ''
              ).toLowerCase();

              const isConnected =
                account.is_connected === undefined
                  ? true
                  : account.is_connected === true;

              return (
                availablePlatforms.includes(
                  platform
                ) && isConnected
              );
            })
            .map((account: any) =>
              String(
                account.platform || ''
              ).toLowerCase()
            );

        setSelectedPlatforms(
          Array.from(
            new Set(connectedPlatforms)
          )
        );
      } catch (err: any) {
        console.error(
          'Create Post data loading error:',
          err
        );

        if (err.response?.status === 401) {
          setError(
            'Your session has expired. Please log in again.'
          );
        } else {
          setError(
            err.response?.data?.detail ||
              'Unable to load social accounts and campaigns.'
          );
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const connectedAccounts =
    socialAccounts.filter(
      (account: any) => {
        const platform = String(
          account.platform || ''
        ).toLowerCase();

        const isConnected =
          account.is_connected === undefined
            ? true
            : account.is_connected === true;

        return (
          availablePlatforms.includes(platform) &&
          isConnected
        );
      }
    );

  const togglePlatform = (
    platform: string
  ) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter(
            (p) => p !== platform
          )
        : [...prev, platform]
    );
  };

  const uploadMedia = async (
    file: File
  ) => {
    const formData = new FormData();

    formData.append('file', file);

    console.log(
      'Sending file to upload endpoint:',
      {
        name: file.name,
        type: file.type,
        size: file.size,
      }
    );

    const response = await api.post(
      '/uploads/',
      formData
    );

    console.log(
      'Upload endpoint response:',
      response.data
    );

    return response.data;
  };

  const handleFileSelect = async (
    files: FileList | null
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles =
      Array.from(files);

    for (const file of selectedFiles) {
      const isImage =
        file.type.startsWith('image/');

      const isVideo =
        file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        setError(
          `${file.name} is not a supported image or video file.`
        );

        continue;
      }

      const maxFileSize =
        50 * 1024 * 1024;

      if (file.size > maxFileSize) {
        setError(
          `${file.name} is larger than 50MB and was not added.`
        );

        continue;
      }

      const previewUrl =
        URL.createObjectURL(file);

      try {
        setError('');
        setUploading(true);

        console.log(
          'Starting media upload:',
          file.name
        );

        const uploadResponse =
          await uploadMedia(file);

        if (
          !uploadResponse ||
          !uploadResponse.media_url
        ) {
          throw new Error(
            'Upload succeeded, but the server did not return a media URL.'
          );
        }

        const uploadedMediaType =
          uploadResponse.media_type ===
          'video'
            ? 'video'
            : 'image';

        setMedia((prev) => [
          ...prev,
          {
            type: uploadedMediaType,
            url: previewUrl,
            name: file.name,
            uploadedUrl:
              uploadResponse.media_url,
          },
        ]);

        console.log(
          'Media uploaded successfully:',
          uploadResponse.media_url
        );
      } catch (err: any) {
        console.error(
          'Media upload error:',
          err
        );

        URL.revokeObjectURL(
          previewUrl
        );

        if (
          err.response?.status === 422
        ) {
          const detail =
            err.response?.data?.detail;

          if (Array.isArray(detail)) {
            setError(
              detail
                .map(
                  (item: any) =>
                    item.msg ||
                    'Invalid upload data.'
                )
                .join(', ')
            );
          } else {
            setError(
              detail ||
                'The selected file could not be uploaded. Please check the file and try again.'
            );
          }
        } else if (
          err.response?.status === 401
        ) {
          setError(
            'Your session has expired. Please log in again.'
          );
        } else {
          setError(
            err.response?.data?.detail ||
              err.message ||
              `Unable to upload ${file.name}.`
          );
        }
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDrop = (
    e: React.DragEvent
  ) => {
    e.preventDefault();

    setIsDragging(false);

    handleFileSelect(
      e.dataTransfer.files
    );
  };

  const removeMedia = (
    idx: number
  ) => {
    setMedia((prev) => {
      const item = prev[idx];

      if (item?.url) {
        URL.revokeObjectURL(
          item.url
        );
      }

      return prev.filter(
        (_, i) => i !== idx
      );
    });
  };

  const createPost = async (
    draftMode: boolean
  ) => {
    setError('');
    setSuccess(false);

    if (!content.trim()) {
      setError(
        'Please write some content for your post.'
      );

      return;
    }

    if (
      content.length > maxLength
    ) {
      setError(
        `Post content cannot exceed ${maxLength} characters.`
      );

      return;
    }

    if (
      selectedPlatforms.length === 0
    ) {
      setError(
        'Select at least one connected platform.'
      );

      return;
    }

    if (
      !draftMode &&
      (!scheduleDate ||
        !scheduleTime)
    ) {
      setError(
        'Please set a schedule date and time.'
      );

      return;
    }

    if (uploading) {
      setError(
        'Please wait until the media upload is complete.'
      );

      return;
    }

    const selectedAccounts =
      connectedAccounts.filter(
        (account: any) => {
          const platform = String(
            account.platform || ''
          ).toLowerCase();

          return selectedPlatforms.includes(
            platform
          );
        }
      );

    const socialAccountIds =
      selectedAccounts
        .map(
          (account: any) =>
            Number(account.id)
        )
        .filter(
          (id: number) =>
            Number.isInteger(id) &&
            id > 0
        );

    if (
      socialAccountIds.length === 0
    ) {
      setError(
        'No connected social accounts were found for the selected platforms.'
      );

      return;
    }

    let scheduledTime:
      | string
      | null = null;

    if (!draftMode) {
      scheduledTime =
        `${scheduleDate}T${scheduleTime}:00`;
    }

    const firstMedia =
      media.length > 0
        ? media[0]
        : null;

    const postData = {
      content:
        content.trim(),

      media_url:
        firstMedia?.uploadedUrl ||
        null,

      media_type:
        firstMedia?.type ||
        'text',

      scheduled_time:
        scheduledTime,

      timezone:
        'Asia/Kolkata',

      campaign_id:
        campaign
          ? Number(campaign)
          : null,

      social_account_ids:
        socialAccountIds,

      save_as_draft:
        draftMode,
    };

    try {
      setPublishing(true);
      setSaveAsDraft(draftMode);

      console.log(
        'Creating post with data:',
        postData
      );

      const response =
        await postService.create(
          postData
        );

      console.log(
        'Create post API response:',
        response.data
      );

      setSuccess(true);

      media.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(
            item.url
          );
        }
      });

      setContent('');
      setMedia([]);
      setScheduleDate('');
      setScheduleTime('');
      setCampaign('');
      setSaveAsDraft(false);

      setSelectedPlatforms(
        Array.from(
          new Set(
            connectedAccounts.map(
              (account: any) =>
                String(
                  account.platform ||
                    ''
                ).toLowerCase()
            )
          )
        )
      );

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error(
        'Create post API error:',
        err
      );

      console.error(
        'Create post API error response:',
        err.response?.data
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          'Your session has expired. Please log in again.'
        );
      } else if (
        err.response?.status === 422
      ) {
        const detail =
          err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map(
                (item: any) =>
                  item.msg ||
                  'Invalid request data.'
              )
              .join(', ')
          );
        } else {
          setError(
            detail ||
              'The post data is invalid. Please check the entered values.'
          );
        }
      } else {
        setError(
          err.response?.data?.detail ||
            'Unable to create the post. Please try again.'
        );
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    createPost(true);
  };

  const handleSchedulePost = () => {
    createPost(false);
  };

  const insertEmoji = (
    emoji: string
  ) => {
    setContent(
      (prev) =>
        prev + emoji
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Create Post
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Compose and schedule content across your social platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Select Platforms
            </h3>

            {loadingData ? (
              <p className="text-sm text-gray-500">
                Loading connected accounts...
              </p>
            ) : connectedAccounts.length ===
              0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700">
                  No connected social accounts found.
                  Please connect a social media account first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availablePlatforms.map(
                  (platform) => {
                    const config =
                      getPlatformConfig(
                        platform
                      );

                    const Icon =
                      config.icon;

                    const isSelected =
                      selectedPlatforms.includes(
                        platform
                      );

                    const isConnected =
                      connectedAccounts.some(
                        (account: any) =>
                          String(
                            account.platform ||
                              ''
                          ).toLowerCase() ===
                          platform
                      );

                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() =>
                          isConnected &&
                          togglePlatform(
                            platform
                          )
                        }
                        disabled={
                          !isConnected
                        }
                        className={cn(
                          'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300',
                          !isConnected &&
                            'opacity-40 cursor-not-allowed'
                        )}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{
                            backgroundColor:
                              config.color,
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <span className="text-xs font-medium text-gray-700">
                          {config.name}
                        </span>

                        {isSelected && (
                          <motion.div
                            initial={{
                              scale: 0,
                            }}
                            animate={{
                              scale: 1,
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Post Content
              </h3>

              <span
                className={cn(
                  'text-xs font-medium',
                  remaining < 0
                    ? 'text-red-500'
                    : remaining < 50
                    ? 'text-amber-500'
                    : 'text-gray-400'
                )}
              >
                {remaining} characters
              </span>
            </div>

            <div className="flex items-center gap-1 mb-2 p-1.5 bg-gray-50 rounded-xl">
              {[
                Bold,
                Italic,
                List,
                Link2,
                Smile,
              ].map(
                (Icon, i) => (
                  <button
                    key={i}
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      i === 4 &&
                      insertEmoji(
                        '😊'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              )}

              <div className="w-px h-5 bg-gray-200 mx-1" />

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploading
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploading
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  insertEmoji('#')
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
              >
                <Hash className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              placeholder="What's on your mind? Write your post content here..."
              rows={6}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFileSelect(
                  e.target.files
                );

                e.target.value = '';
              }}
            />

            {uploading && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Upload className="w-4 h-4 text-indigo-600 animate-pulse" />

                <span className="text-sm text-indigo-700">
                  Uploading media...
                </span>
              </div>
            )}

            {media.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <AnimatePresence>
                  {media.map(
                    (m, idx) => (
                      <motion.div
                        key={`${m.name}-${idx}`}
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                      >
                        {m.type ===
                        'image' ? (
                          <img
                            src={m.url}
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Video className="w-8 h-8 text-white" />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeMedia(
                              idx
                            )
                          }
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>

                        <div className="absolute bottom-1.5 left-1.5 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                          Uploaded
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();

                  setIsDragging(
                    true
                  );
                }}
                onDragLeave={() =>
                  setIsDragging(
                    false
                  )
                }
                onDrop={handleDrop}
                onClick={() =>
                  !uploading &&
                  fileInputRef.current?.click()
                }
                className={cn(
                  'mt-3 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  uploading &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />

                <p className="text-sm text-gray-600 font-medium">
                  {uploading
                    ? 'Uploading...'
                    : 'Drag & drop or click to upload'}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Images and videos up to 50MB
                </p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Schedule & Campaign
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date
                </label>

                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <input
                    type="date"
                    value={
                      scheduleDate
                    }
                    onChange={(e) =>
                      setScheduleDate(
                        e.target.value
                      )
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Time (IST)
                </label>

                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <input
                    type="time"
                    value={
                      scheduleTime
                    }
                    onChange={(e) =>
                      setScheduleTime(
                        e.target.value
                      )
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Campaign (optional)
              </label>

              <select
                value={campaign}
                onChange={(e) =>
                  setCampaign(
                    e.target.value
                  )
                }
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">
                  No campaign
                </option>

                {campaigns.map(
                  (c: any) => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      {c.name ||
                        c.title ||
                        `Campaign ${c.id}`}
                    </option>
                  )
                )}
              </select>
            </div>

            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <button
                type="button"
                onClick={() =>
                  setSaveAsDraft(
                    !saveAsDraft
                  )
                }
                className={cn(
                  'w-4 h-4 rounded border transition-all flex items-center justify-center',
                  saveAsDraft
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 bg-white'
                )}
              >
                {saveAsDraft && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>

              <span className="text-sm text-gray-600">
                Save as draft (don't schedule)
              </span>
            </label>
          </Card>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />

                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              icon={
                <Save className="w-4 h-4" />
              }
              onClick={
                handleSaveDraft
              }
              loading={
                publishing &&
                saveAsDraft
              }
            >
              Save Draft
            </Button>

            <Button
              fullWidth
              icon={
                <Send className="w-4 h-4" />
              }
              onClick={
                handleSchedulePost
              }
              loading={
                publishing &&
                !saveAsDraft
              }
            >
              Schedule Post
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Live Preview
            </h3>

            {selectedPlatforms.length >
            0 ? (
              <div className="space-y-4">
                {selectedPlatforms.map(
                  (platform) => {
                    const config =
                      getPlatformConfig(
                        platform
                      );

                    const Icon =
                      config.icon;

                    return (
                      <motion.div
                        key={platform}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                          <Icon
                            className="w-4 h-4"
                            style={{
                              color:
                                config.color,
                            }}
                          />

                          <span className="text-xs font-medium text-gray-600">
                            {config.name}
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                              SP
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-900">
                                SocialPilot
                              </p>

                              <p className="text-[10px] text-gray-400">
                                Preview
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                            {content ||
                              'Your post content will appear here...'}
                          </p>

                          {media.length >
                            0 && (
                            <div
                              className={cn(
                                'rounded-lg overflow-hidden',
                                media.length >
                                  1 &&
                                  'grid grid-cols-2 gap-1'
                              )}
                            >
                              {media
                                .slice(
                                  0,
                                  4
                                )
                                .map(
                                  (
                                    m,
                                    idx
                                  ) => (
                                    <div
                                      key={
                                        idx
                                      }
                                      className={cn(
                                        'bg-gray-100',
                                        media.length ===
                                          1
                                          ? 'aspect-video'
                                          : 'aspect-square'
                                      )}
                                    >
                                      {m.type ===
                                      'image' ? (
                                        <img
                                          src={
                                            m.url
                                          }
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                          <Video className="w-6 h-6 text-white" />
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />

                <p className="text-sm text-gray-400">
                  Select a platform to preview
                </p>
              </div>
            )}

            {scheduleDate &&
              scheduleTime &&
              !saveAsDraft && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />

                    Scheduled for{' '}
                    {formatDateTime(
                      `${scheduleDate}T${scheduleTime}`
                    )}{' '}
                    IST
                  </div>
                </div>
              )}
          </Card>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-xl"
              >
                <Check className="w-5 h-5" />

                <span className="text-sm font-medium">
                  Post created successfully!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}