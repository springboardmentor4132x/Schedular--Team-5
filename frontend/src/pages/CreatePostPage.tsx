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
import api, {
  accountService,
  postService,
} from '../services/api';
import { getPlatformConfig, cn } from '../utils/helpers';

type SocialAccount = {
  id: number | string;
  platform: string;
  account_id?: string;
  handle?: string;
  username?: string;
  account_name?: string;
  name?: string;
  is_connected?: boolean;
};

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  name: string;
  file: File;
};

type UploadedMedia = {
  media_url: string;
  media_type: 'image' | 'video' | 'carousel';
  filename?: string;
};

export function CreatePostPage() {
  const [content, setContent] = useState('');

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<
    (number | string)[]
  >([]);

  /*
   * Multiple media support.
   *
   * Instagram carousel:
   * 2-10 images
   */
  const [media, setMedia] = useState<MediaItem[]>([]);

  /*
   * Uploaded backend URLs.
   *
   * Each selected file gets its own uploaded URL.
   */
  const [uploadedMedia, setUploadedMedia] = useState<
    UploadedMedia[]
  >([]);

  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const [campaign, setCampaign] = useState('');
  const [isDraftMode, setIsDraftMode] = useState(false);

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const maxLength = 280;
  const remaining = maxLength - content.length;

  /*
   * Load connected social accounts.
   */
  useEffect(() => {
    loadAccounts();
  }, []);

  /*
   * Clean up all browser preview URLs.
   */
  useEffect(() => {
    return () => {
      media.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [media]);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      setError('');

      const response =
        await accountService.getAll();

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.items ||
          response.data?.accounts ||
          [];

      const connectedOnly = data.filter(
        (account: SocialAccount) =>
          account.is_connected === true
      );

      setAccounts(connectedOnly);

      if (connectedOnly.length === 0) {
        setSelectedAccountIds([]);
      }
    } catch (err: any) {
      console.error(
        'Failed to load social accounts:',
        err
      );

      setError(
        err.response?.data?.detail ||
          'Failed to load connected social accounts.'
      );
    } finally {
      setLoadingAccounts(false);
    }
  };

  const toggleAccount = (
    accountId: number | string
  ) => {
    setSelectedAccountIds((previous) =>
      previous.includes(accountId)
        ? previous.filter(
            (id) => id !== accountId
          )
        : [...previous, accountId]
    );
  };

  const getAccountDisplayName = (
    account: SocialAccount
  ) => {
    return (
      account.handle ||
      account.username ||
      account.account_name ||
      account.name ||
      'Connected account'
    );
  };

  const getPlatformName = (
    platform: string
  ) => {
    const config =
      getPlatformConfig(platform);

    return config?.name || platform;
  };

  /*
   * Determine selected platform.
   */
  const getSelectedPlatform = () => {
    if (selectedAccountIds.length === 0) {
      return null;
    }

    const selectedAccount =
      accounts.find((account) =>
        selectedAccountIds.includes(account.id)
      );

    if (!selectedAccount) {
      return null;
    }

    let platform =
      selectedAccount.platform
        ?.toLowerCase()
        .trim();

    if (platform === 'twitter') {
      platform = 'x';
    }

    return platform;
  };

  /*
   * Upload one file to backend.
   */
  const uploadMediaToBackend = async (
    file: File
  ): Promise<UploadedMedia> => {
    const platform =
      getSelectedPlatform();

    if (!platform) {
      throw new Error(
        'Unable to determine the selected social platform.'
      );
    }

    const formData = new FormData();

    formData.append('file', file);

    console.log(
      'Uploading media:',
      {
        platform,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }
    );

    const response = await api.post(
      `/uploads/?platform=${encodeURIComponent(
        platform
      )}`,
      formData
    );

    console.log(
      'Media upload response:',
      response.data
    );

    if (
      !response.data?.media_url ||
      !response.data?.media_type
    ) {
      throw new Error(
        'Backend did not return media_url or media_type.'
      );
    }

    return {
      media_url:
        response.data.media_url,
      media_type:
        response.data.media_type,
      filename:
        response.data.filename,
    };
  };

  /*
   * Validate selected files.
   */
  const validateFiles = (
    files: File[]
  ) => {
    if (files.length === 0) {
      return;
    }

    /*
     * Maximum carousel size.
     */
    if (files.length > 10) {
      throw new Error(
        'Instagram carousel supports a maximum of 10 images.'
      );
    }

    /*
     * Determine whether this is a
     * multi-image selection.
     */
    const imageFiles = files.filter(
      (file) =>
        file.type.startsWith('image/')
    );

    const videoFiles = files.filter(
      (file) =>
        file.type.startsWith('video/')
    );

    /*
     * Multiple files must all be images.
     */
    if (
      files.length > 1 &&
      (
        videoFiles.length > 0 ||
        imageFiles.length !== files.length
      )
    ) {
      throw new Error(
        'Instagram carousel supports multiple images only. Select one video or 2-10 images.'
      );
    }

    /*
     * Individual file validation.
     */
    for (const file of files) {
      const isImage =
        file.type.startsWith('image/');

      const isVideo =
        file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new Error(
          `${file.name} is not a supported image or video file.`
        );
      }

      if (
        file.size >
        50 * 1024 * 1024
      ) {
        throw new Error(
          `${file.name} is larger than 50MB.`
        );
      }
    }

    /*
     * A single video is allowed.
     */
    if (
      files.length === 1 &&
      videoFiles.length === 1
    ) {
      return;
    }

    /*
     * A single image is allowed.
     */
    if (
      files.length === 1 &&
      imageFiles.length === 1
    ) {
      return;
    }

    /*
     * Multiple images must be 2-10.
     */
    if (
      files.length >= 2 &&
      files.length <= 10 &&
      imageFiles.length === files.length
    ) {
      return;
    }

    throw new Error(
      'Please select one image/video or 2-10 images for an Instagram carousel.'
    );
  };

  /*
   * Handle image/video selection.
   *
   * Supports:
   *
   * 1 image
   * 1 video
   * 2-10 images
   */
  const handleFileSelect = async (
    files: FileList | null
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    if (selectedAccountIds.length === 0) {
      setError(
        'Please select at least one connected social account before uploading media.'
      );
      return;
    }

    const selectedFiles =
      Array.from(files);

    try {
      setError('');
      setSuccess(false);

      validateFiles(
        selectedFiles
      );

      /*
       * Clear existing media before
       * adding the new selection.
       */
      media.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });

      setMedia([]);
      setUploadedMedia([]);

      setUploading(true);

      /*
       * Create local previews.
       */
      const previewItems =
        selectedFiles.map(
          (file) => ({
            type: file.type.startsWith(
              'video/'
            )
              ? ('video' as const)
              : ('image' as const),

            url: URL.createObjectURL(
              file
            ),

            name: file.name,

            file,
          })
        );

      setMedia(
        previewItems
      );

      /*
       * Upload every selected file.
       */
      const uploadedItems: UploadedMedia[] =
        [];

      for (
        let index = 0;
        index <
        selectedFiles.length;
        index++
      ) {
        const file =
          selectedFiles[index];

        console.log(
          `Uploading media ${index + 1}/${selectedFiles.length}:`,
          file.name
        );

        const uploaded =
          await uploadMediaToBackend(
            file
          );

        uploadedItems.push(
          uploaded
        );
      }

      /*
       * If multiple images were uploaded,
       * mark the post as carousel.
       */
      if (
        uploadedItems.length >= 2
      ) {
        setUploadedMedia(
          uploadedItems.map(
            (item) => ({
              ...item,
              media_type:
                'carousel',
            })
          )
        );
      } else {
        setUploadedMedia(
          uploadedItems
        );
      }

      console.log(
        'All media uploaded successfully:',
        uploadedItems
      );
    } catch (err: any) {
      console.error(
        'Media upload error:',
        err
      );

      /*
       * Clean preview URLs.
       */
      media.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(
            item.url
          );
        }
      });

      setMedia([]);
      setUploadedMedia([]);

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item: any) =>
                item.msg ||
                'Media upload validation error'
            )
            .join(', ')
        );
      } else {
        setError(
          detail ||
            err.message ||
            'Unable to upload media.'
        );
      }
    } finally {
      setUploading(false);
    }
  };

  /*
   * Remove one media item.
   */
  const removeMedia = (
    index: number
  ) => {
    const item =
      media[index];

    if (item?.url) {
      URL.revokeObjectURL(
        item.url
      );
    }

    setMedia((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

    setUploadedMedia(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  };

  /*
   * Remove all media.
   */
  const removeAllMedia = () => {
    media.forEach((item) => {
      if (item.url) {
        URL.revokeObjectURL(item.url);
      }
    });

    setMedia([]);
    setUploadedMedia([]);
  };

  /*
   * CANCEL CREATE POST
   *
   * This does NOT call the backend.
   *
   * It simply clears the current form,
   * removes uploaded previews from the UI,
   * and returns the page to its initial state.
   */
  const handleCancelForm = () => {
    if (publishing || uploading) {
      return;
    }

    media.forEach((item) => {
      if (item.url) {
        URL.revokeObjectURL(item.url);
      }
    });

    setContent('');
    setMedia([]);
    setUploadedMedia([]);

    setScheduleDate('');
    setScheduleTime('');

    setCampaign('');
    setIsDraftMode(false);

    setSelectedAccountIds([]);

    setError('');
    setSuccess(false);
    setIsDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /*
   * Create scheduled post or draft.
   */
  const handlePostSubmission = async (
    overrideDraftMode?: boolean
  ) => {
    setError('');
    setSuccess(false);

    const activeDraftMode =
      overrideDraftMode !== undefined
        ? overrideDraftMode
        : isDraftMode;

    /*
     * Content validation.
     */
    if (!content.trim()) {
      setError(
        'Please write some content for your post.'
      );
      return;
    }

    if (
      content.length >
      maxLength
    ) {
      setError(
        `Post content cannot exceed ${maxLength} characters.`
      );
      return;
    }

    /*
     * Social account validation.
     */
    if (
      selectedAccountIds.length === 0
    ) {
      setError(
        'Select at least one connected social account.'
      );
      return;
    }

    /*
     * Schedule validation.
     */
    if (
      !activeDraftMode &&
      (!scheduleDate ||
        !scheduleTime)
    ) {
      setError(
        'Please set a schedule date and time.'
      );
      return;
    }

    /*
     * Media upload validation.
     */
    if (
      media.length > 0 &&
      uploadedMedia.length !==
        media.length
    ) {
      setError(
        'Please wait for all media uploads to finish before scheduling the post.'
      );
      return;
    }

    /*
     * Determine media type.
     */
    let mediaType:
      | 'text'
      | 'image'
      | 'video'
      | 'carousel' =
      'text';

    if (
      uploadedMedia.length >= 2
    ) {
      mediaType =
        'carousel';
    } else if (
      uploadedMedia.length === 1
    ) {
      mediaType =
        uploadedMedia[0]
          .media_type as
          | 'image'
          | 'video';
    }

    /*
     * Determine media URL.
     *
     * Single media:
     *
     * "https://..."
     *
     * Carousel:
     *
     * '["https://...", "https://..."]'
     *
     * This matches the backend
     * _parse_media_urls() implementation.
     */
    let mediaUrl:
      | string
      | null =
      null;

    if (
      uploadedMedia.length === 1
    ) {
      mediaUrl =
        uploadedMedia[0]
          .media_url;
    }

    if (
      uploadedMedia.length >= 2
    ) {
      mediaUrl =
        JSON.stringify(
          uploadedMedia.map(
            (item) =>
              item.media_url
          )
        );
    }

    /*
     * Build scheduled timestamp.
     *
     * The UI time is IST.
     *
     * Backend receives:
     *
     * timezone: Asia/Kolkata
     */
    let scheduledTime:
      | string
      | null =
      null;

    if (!activeDraftMode) {
      scheduledTime =
        `${scheduleDate}T${scheduleTime}:00`;
    }

    /*
     * Build backend request.
     */
    const postData = {
      client_id: null,

      content:
        content.trim(),

      media_url:
        mediaUrl,

      media_type:
        mediaType,

      scheduled_time:
        scheduledTime,

      timezone:
        'Asia/Kolkata',

      campaign_id: null,

      social_account_ids:
        selectedAccountIds.map(
          Number
        ),

      save_as_draft:
        activeDraftMode,
    };

    try {
      setPublishing(true);

      console.log(
        'Creating backend post:',
        postData
      );

      const response =
        await postService.create(
          postData
        );

      console.log(
        'Backend create post response:',
        response.data
      );

      setSuccess(true);

      /*
       * Clean local preview URLs.
       */
      media.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });

      /*
       * Reset form.
       */
      setContent('');

      setMedia([]);

      setUploadedMedia([]);

      setScheduleDate('');

      setScheduleTime('');

      setCampaign('');

      setIsDraftMode(false);

      setSelectedAccountIds([]);

      /*
       * Hide success message.
       */
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error(
        'Create post error:',
        err
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item: any) =>
                item.msg ||
                'Validation error'
            )
            .join(', ')
        );
      } else {
        setError(
          detail ||
            'Unable to create the post. Please try again.'
        );
      }
    } finally {
      setPublishing(false);
    }
  };

  /*
   * Determine whether current media
   * represents a carousel.
   */
  const isCarousel =
    media.length >= 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Create Post
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Compose and schedule content across
          your connected social platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ====================================================== */}
          {/* CONNECTED SOCIAL ACCOUNTS */}
          {/* ====================================================== */}

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Select Social Accounts
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Select the connected accounts where
                  this post should be scheduled.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAccounts}
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Refresh
              </button>
            </div>

            {loadingAccounts ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Loading connected accounts...
              </div>
            ) : accounts.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">
                  No connected social accounts found.
                </p>

                <p className="text-xs text-amber-700 mt-1">
                  Connect Facebook, Instagram, or
                  another platform from the Social
                  Accounts page first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.map((account) => {
                  const platform =
                    account.platform?.toLowerCase();

                  const config =
                    getPlatformConfig(platform);

                  const Icon =
                    config.icon;

                  const selected =
                    selectedAccountIds.includes(
                      account.id
                    );

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() =>
                        toggleAccount(
                          account.id
                        )
                      }
                      className={cn(
                        'relative flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                        selected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{
                          backgroundColor:
                            config.color,
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">
                          {getPlatformName(
                            platform
                          )}
                        </p>

                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getAccountDisplayName(
                            account
                          )}
                        </p>
                      </div>

                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedAccountIds.length > 0 && (
              <p className="text-xs text-indigo-600 mt-3">
                {selectedAccountIds.length}{' '}
                account
                {selectedAccountIds.length >
                1
                  ? 's'
                  : ''}{' '}
                selected
              </p>
            )}
          </Card>

          {/* ====================================================== */}
          {/* POST CONTENT */}
          {/* ====================================================== */}

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

            {/* Toolbar */}
            <div className="flex items-center gap-1 mb-2 p-1.5 bg-gray-50 rounded-xl">
              {[
                Bold,
                Italic,
                List,
                Link2,
                Smile,
              ].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    if (i === 4) {
                      setContent(
                        (prev) =>
                          prev + '😊'
                      );
                    }
                  }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}

              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Image button */}
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploading ||
                  publishing
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Upload image or carousel"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Video button */}
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploading ||
                  publishing
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Upload video"
              >
                <Video className="w-4 h-4" />
              </button>

              {/* Hashtag */}
              <button
                type="button"
                onClick={() =>
                  setContent(
                    (prev) =>
                      prev + '#'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
                title="Add hashtag"
              >
                <Hash className="w-4 h-4" />
              </button>
            </div>

            {/* Content textarea */}
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

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/webm"
              className="hidden"
              onChange={(e) => {
                handleFileSelect(
                  e.target.files
                );

                e.target.value = '';
              }}
            />

            {/* Uploading indicator */}
            {uploading && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Upload className="w-4 h-4 text-indigo-600 animate-pulse" />

                <div>
                  <span className="text-sm text-indigo-700">
                    Uploading media to backend...
                  </span>

                  <p className="text-xs text-indigo-500 mt-0.5">
                    Uploading{' '}
                    {media.length}{' '}
                    media item
                    {media.length !== 1
                      ? 's'
                      : ''}.
                    Please wait.
                  </p>
                </div>
              </div>
            )}

            {/* Upload success */}
            {uploadedMedia.length > 0 &&
              !uploading && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm text-green-700 font-medium">
                      Media uploaded successfully
                    </p>

                    <p className="text-xs text-green-600 mt-0.5">
                      {isCarousel
                        ? `Instagram carousel • ${uploadedMedia.length} images`
                        : `${uploadedMedia[0].media_type}`}
                    </p>
                  </div>
                </div>
              )}

            {/* ====================================================== */}
            {/* MEDIA PREVIEW */}
            {/* ====================================================== */}

            {media.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {isCarousel
                        ? `Carousel • ${media.length}/10 images`
                        : 'Selected media'}
                    </p>

                    <p className="text-xs text-gray-400">
                      {isCarousel
                        ? 'These images will be published as one Instagram carousel.'
                        : 'Your selected media.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeAllMedia
                    }
                    disabled={
                      uploading ||
                      publishing
                    }
                    className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
                  >
                    Remove all
                  </button>
                </div>

                <div
                  className={cn(
                    'grid gap-3',
                    media.length === 1
                      ? 'grid-cols-1 max-w-sm'
                      : 'grid-cols-2 sm:grid-cols-3'
                  )}
                >
                  {media.map(
                    (
                      item,
                      index
                    ) => (
                      <motion.div
                        key={`${item.name}-${index}`}
                        initial={{
                          opacity: 0,
                          scale: 0.9,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                      >
                        {item.type ===
                        'image' ? (
                          <img
                            src={
                              item.url
                            }
                            alt={
                              item.name
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={
                              item.url
                            }
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Remove individual media */}
                        <button
                          type="button"
                          onClick={() =>
                            removeMedia(
                              index
                            )
                          }
                          disabled={
                            uploading ||
                            publishing
                          }
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>

                        {/* Item number */}
                        {isCarousel && (
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center">
                            {index +
                              1}
                          </div>
                        )}

                        {/* Upload status */}
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                          {uploadedMedia[
                            index
                          ]
                            ? 'Uploaded'
                            : 'Uploading'}
                        </div>
                      </motion.div>
                    )
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 truncate">
                    {media.length ===
                    1
                      ? media[0]
                          .name
                      : `${media.length} images selected`}
                  </p>

                  {isCarousel && (
                    <span className="text-xs text-indigo-600 font-medium">
                      Instagram Carousel
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ====================================================== */}
            {/* DRAG AND DROP */}
            {/* ====================================================== */}

            {media.length ===
              0 && (
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
                onDrop={(e) => {
                  e.preventDefault();

                  setIsDragging(
                    false
                  );

                  handleFileSelect(
                    e.dataTransfer
                      .files
                  );
                }}
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
                  1 image/video or
                  2-10 images for
                  Instagram carousel
                </p>
              </div>
            )}
          </Card>

          {/* ====================================================== */}
          {/* SCHEDULE CONFIGURATION */}
          {/* ====================================================== */}

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Schedule & Campaign
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date
                </label>

                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <input
                    type="date"
                    disabled={
                      isDraftMode ||
                      publishing
                    }
                    value={
                      scheduleDate
                    }
                    onChange={(e) =>
                      setScheduleDate(
                        e.target
                          .value
                      )
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Time (IST)
                </label>

                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                  <input
                    type="time"
                    disabled={
                      isDraftMode ||
                      publishing
                    }
                    value={
                      scheduleTime
                    }
                    onChange={(e) =>
                      setScheduleTime(
                        e.target
                          .value
                      )
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Campaign */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Campaign (optional)
              </label>

              <input
                type="text"
                placeholder="Campaign integration will be connected later..."
                value={campaign}
                onChange={(e) =>
                  setCampaign(
                    e.target
                      .value
                  )
                }
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />

              <p className="text-xs text-gray-400 mt-1">
                Campaign selection is
                not sent to the
                backend yet.
              </p>
            </div>

            {/* Draft */}
            <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
              <button
                type="button"
                onClick={() =>
                  setIsDraftMode(
                    !isDraftMode
                  )
                }
                disabled={
                  publishing
                }
                className={cn(
                  'w-4 h-4 rounded border transition-all flex items-center justify-center',
                  isDraftMode
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isDraftMode && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </button>

              <span className="text-sm text-gray-600">
                Save as draft
                (don't schedule)
              </span>
            </label>
          </Card>

          {/* ====================================================== */}
          {/* ALERTS */}
          {/* ====================================================== */}

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
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />

                <span>
                  {error}
                </span>
              </motion.div>
            )}

            {success && (
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
                className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700"
              >
                <Check className="w-4 h-4 flex-shrink-0" />

                Post created
                successfully in
                the backend!
              </motion.div>
            )}
          </AnimatePresence>

          {/* ====================================================== */}
          {/* ACTIONS */}
          {/* ====================================================== */}

          <div className="flex gap-3">
            {/* Cancel Create Post */}
            <Button
              variant="secondary"
              fullWidth
              icon={
                <X className="w-4 h-4" />
              }
              onClick={
                handleCancelForm
              }
              disabled={
                publishing ||
                uploading
              }
            >
              Cancel
            </Button>

            {/* Save Draft */}
            <Button
              variant="secondary"
              fullWidth
              icon={
                <Save className="w-4 h-4" />
              }
              onClick={() =>
                handlePostSubmission(
                  true
                )
              }
              loading={
                publishing &&
                isDraftMode
              }
              disabled={
                publishing ||
                uploading ||
                loadingAccounts
              }
            >
              Save Draft
            </Button>

            {/* Schedule */}
            <Button
              variant="primary"
              fullWidth
              icon={
                <Send className="w-4 h-4" />
              }
              onClick={() =>
                handlePostSubmission(
                  false
                )
              }
              loading={
                publishing &&
                !isDraftMode
              }
              disabled={
                publishing ||
                uploading ||
                loadingAccounts
              }
            >
              {isDraftMode
                ? 'Confirm Draft'
                : 'Schedule Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

