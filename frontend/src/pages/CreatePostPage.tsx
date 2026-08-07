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
import { ContentPreview } from '../components/ContentPreview';
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

type PostMediaType =
  | 'text'
  | 'image'
  | 'video'
  | 'carousel';

const IMAGE_PLATFORMS = [
  'facebook',
  'instagram',
  'linkedin',
];

const VIDEO_PLATFORMS = [
  'facebook',
  'instagram',
  'linkedin',
  'youtube',
];

const normalizePlatform = (
  platform?: string
): string => {
  const normalized =
    platform?.toLowerCase().trim() || '';

  if (normalized === 'twitter') {
    return 'x';
  }

  return normalized;
};

const isImagePlatform = (
  platform: string
) =>
  IMAGE_PLATFORMS.includes(
    normalizePlatform(platform)
  );

const isVideoPlatform = (
  platform: string
) =>
  VIDEO_PLATFORMS.includes(
    normalizePlatform(platform)
  );

const isValidRemoteUrl = (
  value?: string | null
): boolean => {
  if (!value) {
    return false;
  }

  if (
    value.startsWith('blob:') ||
    value.includes('blob:')
  ) {
    return false;
  }

  return (
    value.startsWith('https://') ||
    value.startsWith('http://')
  );
};

export function CreatePostPage() {
  const [content, setContent] = useState('');

  const [accounts, setAccounts] =
    useState<SocialAccount[]>([]);

  const [
    selectedAccountIds,
    setSelectedAccountIds,
  ] = useState<(number | string)[]>([]);

  const [media, setMedia] =
    useState<MediaItem[]>([]);

  const [uploadedMedia, setUploadedMedia] =
    useState<UploadedMedia[]>([]);

  const [scheduleDate, setScheduleDate] =
    useState('');

  const [scheduleTime, setScheduleTime] =
    useState('');

  const [campaign, setCampaign] =
    useState('');

  const [isDraftMode, setIsDraftMode] =
    useState(false);

  const [loadingAccounts, setLoadingAccounts] =
    useState(true);

  const [publishing, setPublishing] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState('');

  const [isDragging, setIsDragging] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const maxLength = 280;

  const remaining =
    maxLength - content.length;

  useEffect(() => {
    loadAccounts();
  }, []);

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

      const data = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.items ||
          response.data?.accounts ||
          [];

      const connectedOnly =
        data.filter(
          (account: SocialAccount) =>
            account.is_connected === true
        );

      setAccounts(connectedOnly);

      if (
        connectedOnly.length === 0
      ) {
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
    setSelectedAccountIds(
      (previous) =>
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

    return (
      config?.name ||
      platform
    );
  };

  const getSelectedPlatforms =
    (): string[] => {
      return Array.from(
        new Set(
          accounts
            .filter((account) =>
              selectedAccountIds.includes(
                account.id
              )
            )
            .map((account) =>
              normalizePlatform(
                account.platform
              )
            )
        )
      );
    };

  const getSelectedPlatform =
    (): string | null => {
      const platforms =
        getSelectedPlatforms();

      if (platforms.length === 0) {
        return null;
      }

      return platforms[0];
    };

  const validateMediaAgainstPlatforms = (
    files: File[]
  ) => {
    const selectedPlatforms =
      getSelectedPlatforms();

    if (
      selectedPlatforms.length === 0
    ) {
      throw new Error(
        'Please select at least one connected social account before uploading media.'
      );
    }

    const hasVideo = files.some(
      (file) =>
        file.type.startsWith('video/')
    );

    const hasImage = files.some(
      (file) =>
        file.type.startsWith('image/')
    );

    if (hasVideo && hasImage) {
      throw new Error(
        'Please select either images or videos, not both.'
      );
    }

    if (hasVideo) {
      const unsupported =
        selectedPlatforms.filter(
          (platform) =>
            !isVideoPlatform(platform)
        );

      if (
        unsupported.length > 0
      ) {
        throw new Error(
          `Video publishing is supported only for Instagram, Facebook, LinkedIn, and YouTube. Remove unsupported selected accounts before uploading the video.`
        );
      }
    }

    if (hasImage) {
      const unsupported =
        selectedPlatforms.filter(
          (platform) =>
            !isImagePlatform(platform)
        );

      if (
        unsupported.length > 0
      ) {
        throw new Error(
          `Image publishing is supported only for Instagram, Facebook, and LinkedIn. Remove unsupported selected accounts before uploading the image.`
        );
      }
    }
  };

  const uploadMediaToBackend = async (
    file: File
  ): Promise<UploadedMedia> => {
    const selectedPlatforms =
      getSelectedPlatforms();

    if (
      selectedPlatforms.length === 0
    ) {
      throw new Error(
        'No social platform selected.'
      );
    }

    const isVideo =
      file.type.startsWith('video/');

    const isImage =
      file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      throw new Error(
        'Only image and video files are supported.'
      );
    }

    const uploadPlatform =
      isVideo
        ? selectedPlatforms.find(
            (platform) =>
              isVideoPlatform(platform)
          )
        : selectedPlatforms.find(
            (platform) =>
              isImagePlatform(platform)
          );

    if (!uploadPlatform) {
      throw new Error(
        isVideo
          ? 'No supported platform is selected for video publishing.'
          : 'No supported platform is selected for image publishing.'
      );
    }

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    console.log(
      '>>> MEDIA UPLOAD START',
      {
        filename: file.name,
        contentType: file.type,
        size: file.size,
        platform: uploadPlatform,
      }
    );

    const response =
      await api.post(
        `/uploads/?platform=${encodeURIComponent(
          uploadPlatform
        )}`,
        formData
      );

    console.log(
      '>>> MEDIA UPLOAD RESPONSE',
      response.data
    );

    const uploadedUrl =
      response.data?.media_url;

    const uploadedType =
      response.data?.media_type;

    if (
      !isValidRemoteUrl(
        uploadedUrl
      )
    ) {
      throw new Error(
        'Backend did not return a valid HTTPS media URL. The upload was not completed.'
      );
    }

    if (
      !uploadedType
    ) {
      throw new Error(
        'Backend did not return media_type.'
      );
    }

    return {
      media_url:
        uploadedUrl,
      media_type:
        uploadedType,
      filename:
        response.data?.filename,
    };
  };

  const validateFiles = (
    files: File[]
  ) => {
    if (
      files.length === 0
    ) {
      return;
    }

    if (
      files.length > 10
    ) {
      throw new Error(
        'You can select a maximum of 10 images.'
      );
    }

    const imageFiles =
      files.filter(
        (file) =>
          file.type.startsWith(
            'image/'
          )
      );

    const videoFiles =
      files.filter(
        (file) =>
          file.type.startsWith(
            'video/'
          )
      );

    if (
      imageFiles.length +
        videoFiles.length !==
      files.length
    ) {
      throw new Error(
        'Only image and video files are supported.'
      );
    }

    if (
      videoFiles.length > 0 &&
      files.length > 1
    ) {
      throw new Error(
        'Only one video can be uploaded at a time.'
      );
    }

    if (
      files.length > 1 &&
      imageFiles.length !==
        files.length
    ) {
      throw new Error(
        'Multiple files are allowed only for image carousels.'
      );
    }

    if (
      files.length > 1 &&
      files.length < 2
    ) {
      throw new Error(
        'Select at least 2 images for a carousel.'
      );
    }

    for (
      const file of files
    ) {
      if (
        file.size >
        50 *
          1024 *
          1024
      ) {
        throw new Error(
          `${file.name} is larger than 50 MB.`
        );
      }
    }

    validateMediaAgainstPlatforms(
      files
    );
  };

  const handleFileSelect =
    async (
      files: FileList | null
    ) => {
      if (
        !files ||
        files.length === 0
      ) {
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

        media.forEach(
          (item) => {
            if (item.url) {
              URL.revokeObjectURL(
                item.url
              );
            }
          }
        );

        setMedia([]);
        setUploadedMedia([]);

        setUploading(true);

        const previewItems =
          selectedFiles.map(
            (file) => ({
              type:
                file.type.startsWith(
                  'video/'
                )
                  ? ('video' as const)
                  : ('image' as const),

              url:
                URL.createObjectURL(
                  file
                ),

              name:
                file.name,

              file,
            })
          );

        setMedia(
          previewItems
        );

        const uploadedItems:
          UploadedMedia[] =
          [];

        for (
          let index = 0;
          index <
          selectedFiles.length;
          index++
        ) {
          const file =
            selectedFiles[
              index
            ];

          console.log(
            `>>> UPLOADING ${index + 1}/${selectedFiles.length}`,
            file.name
          );

          const uploaded =
            await uploadMediaToBackend(
              file
            );

          if (
            !isValidRemoteUrl(
              uploaded.media_url
            )
          ) {
            throw new Error(
              `Upload completed but returned an invalid media URL for ${file.name}.`
            );
          }

          uploadedItems.push(
            uploaded
          );
        }

        if (
          uploadedItems.length >=
          2
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
          '>>> ALL MEDIA UPLOADED',
          uploadedItems
        );
      } catch (
        err: any
      ) {
        console.error(
          'Media upload error:',
          err
        );

        media.forEach(
          (item) => {
            if (
              item.url
            ) {
              URL.revokeObjectURL(
                item.url
              );
            }
          }
        );

        setMedia([]);
        setUploadedMedia([]);

        const detail =
          err.response?.data
            ?.detail;

        if (
          Array.isArray(
            detail
          )
        ) {
          setError(
            detail
              .map(
                (item: any) =>
                  item.msg ||
                  'Media upload validation error'
              )
              .join(
                ', '
              )
          );
        } else {
          setError(
            detail ||
              err.message ||
              'Unable to upload media.'
          );
        }
      } finally {
        setUploading(
          false
        );
      }
    };

  const removeMedia = (
    index: number
  ) => {
    const item =
      media[index];

    if (
      item?.url
    ) {
      URL.revokeObjectURL(
        item.url
      );
    }

    setMedia(
      (previous) =>
        previous.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !==
            index
        )
    );

    setUploadedMedia(
      (previous) =>
        previous.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !==
            index
        )
    );
  };

  const removeAllMedia =
    () => {
      media.forEach(
        (item) => {
          if (
            item.url
          ) {
            URL.revokeObjectURL(
              item.url
            );
          }
        }
      );

      setMedia([]);
      setUploadedMedia([]);
    };

  const handleCancelForm =
    () => {
      if (
        publishing ||
        uploading
      ) {
        return;
      }

      media.forEach(
        (item) => {
          if (
            item.url
          ) {
            URL.revokeObjectURL(
              item.url
            );
          }
        }
      );

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

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          '';
      }
    };

  const handlePostSubmission =
    async (
      overrideDraftMode?: boolean
    ) => {
      setError('');
      setSuccess(false);

      const activeDraftMode =
        overrideDraftMode !==
        undefined
          ? overrideDraftMode
          : isDraftMode;

      if (
        !content.trim()
      ) {
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

      if (
        selectedAccountIds.length ===
        0
      ) {
        setError(
          'Select at least one connected social account.'
        );
        return;
      }

      const selectedPlatforms =
        getSelectedPlatforms();

      if (
        selectedPlatforms.length ===
        0
      ) {
        setError(
          'Unable to determine the selected social platforms.'
        );
        return;
      }

      if (
        !activeDraftMode &&
        (
          !scheduleDate ||
          !scheduleTime
        )
      ) {
        setError(
          'Please set a schedule date and time.'
        );
        return;
      }

      if (
        uploading
      ) {
        setError(
          'Please wait until media upload finishes.'
        );
        return;
      }

      if (
        media.length > 0
      ) {
        if (
          uploadedMedia.length !==
          media.length
        ) {
          setError(
            'Media upload is incomplete. Please wait for the upload to finish.'
          );
          return;
        }

        const invalidMedia =
          uploadedMedia.some(
            (item) =>
              !isValidRemoteUrl(
                item.media_url
              )
          );

        if (
          invalidMedia
        ) {
          setError(
            'One or more media URLs are invalid. Please upload the media again.'
          );
          return;
        }
      }

      let mediaType:
        PostMediaType =
        'text';

      if (
        uploadedMedia.length >=
        2
      ) {
        mediaType =
          'carousel';
      } else if (
        uploadedMedia.length ===
        1
      ) {
        mediaType =
          uploadedMedia[0]
            .media_type as
            | 'image'
            | 'video';
      }

      let mediaUrl:
        string | null =
        null;

      if (
        uploadedMedia.length ===
        1
      ) {
        mediaUrl =
          uploadedMedia[0]
            .media_url;
      } else if (
        uploadedMedia.length >=
        2
      ) {
        mediaUrl =
          JSON.stringify(
            uploadedMedia.map(
              (
                item
              ) =>
                item.media_url
            )
          );
      }

      if (
        mediaUrl &&
        (
          mediaUrl.startsWith(
            'blob:'
          ) ||
          mediaUrl.includes(
            'blob:'
          )
        )
      ) {
        setError(
          'Cannot schedule this post because the media URL is a browser blob URL. Please upload the media again.'
        );
        return;
      }

      if (
        mediaUrl &&
        mediaUrl.length > 0 &&
        !mediaUrl.startsWith(
          'http://'
        ) &&
        !mediaUrl.startsWith(
          'https://'
        )
      ) {
        setError(
          'Cannot schedule this post because the media URL is invalid.'
        );
        return;
      }

      let scheduledTime:
        string | null =
        null;

      if (
        !activeDraftMode
      ) {
        scheduledTime =
          `${scheduleDate}T${scheduleTime}:00`;
      }

      const postData = {
        client_id:
          null,

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

        campaign_id:
          null,

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
          '>>> FINAL POST PAYLOAD',
          postData
        );

        console.log(
          '>>> FINAL MEDIA URL',
          mediaUrl
        );

        if (
          mediaUrl &&
          (
            mediaUrl.includes(
              'blob:'
            ) ||
            mediaUrl.startsWith(
              'blob:'
            )
          )
        ) {
          throw new Error(
            'Blocked invalid blob media URL before sending request.'
          );
        }

        const response =
          await postService.create(
            postData
          );

        console.log(
          '>>> POST CREATED',
          response.data
        );

        if (
          response.data?.media_url &&
          (
            response.data.media_url.startsWith(
              'blob:'
            ) ||
            response.data.media_url.includes(
              'blob:'
            )
          )
        ) {
          throw new Error(
            'Backend stored a blob media URL. This post should not be used for publishing.'
          );
        }

        setSuccess(
          true
        );

        media.forEach(
          (item) => {
            if (
              item.url
            ) {
              URL.revokeObjectURL(
                item.url
              );
            }
          }
        );

        setContent('');
        setMedia([]);
        setUploadedMedia([]);
        setScheduleDate('');
        setScheduleTime('');
        setCampaign('');
        setIsDraftMode(false);
        setSelectedAccountIds([]);

        setTimeout(
          () => {
            setSuccess(
              false
            );
          },
          3000
        );
      } catch (
        err: any
      ) {
        console.error(
          'Create post error:',
          err
        );

        const detail =
          err.response?.data
            ?.detail;

        if (
          Array.isArray(
            detail
          )
        ) {
          setError(
            detail
              .map(
                (item: any) =>
                  item.msg ||
                  'Validation error'
              )
              .join(
                ', '
              )
          );
        } else {
          setError(
            detail ||
              err.message ||
              'Unable to create the post. Please try again.'
          );
        }
      } finally {
        setPublishing(
          false
        );
      }
    };

  const isCarousel =
    media.length >= 2;

  const selectedPlatforms =
    getSelectedPlatforms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Create Post
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Compose and schedule content across
          your connected social platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Select Social Accounts
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Images: Instagram, Facebook,
                  LinkedIn. Videos: Instagram,
                  Facebook, LinkedIn, YouTube.
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
                  Connect your social accounts
                  first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.map(
                  (account) => {
                    const platform =
                      normalizePlatform(
                        account.platform
                      );

                    const config =
                      getPlatformConfig(
                        platform
                      );

                    const Icon =
                      config?.icon ||
                      ImageIcon;

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
                              config?.color ||
                              '#6366f1',
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
                  }
                )}
              </div>
            )}

            {selectedAccountIds.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-indigo-600">
                  {selectedAccountIds.length}{' '}
                  account
                  {selectedAccountIds.length >
                  1
                    ? 's'
                    : ''}{' '}
                  selected
                </p>

                <p className="text-xs text-gray-500">
                  Platforms:{' '}
                  {selectedPlatforms
                    .map(
                      getPlatformName
                    )
                    .join(', ')}
                </p>
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
                (Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      if (
                        index ===
                        4
                      ) {
                        setContent(
                          (prev) =>
                            prev +
                            '😊'
                        );
                      }
                    }}
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
                  uploading ||
                  publishing ||
                  selectedAccountIds.length ===
                    0
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Upload image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploading ||
                  publishing ||
                  selectedAccountIds.length ===
                    0
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Upload video"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setContent(
                    (prev) =>
                      prev + '#'
                  )
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
              >
                <Hash className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              placeholder="What's on your mind? Write your post content here..."
              rows={6}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/webm"
              className="hidden"
              onChange={(event) => {
                handleFileSelect(
                  event.target.files
                );

                event.target.value =
                  '';
              }}
            />

            {uploading && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Upload className="w-4 h-4 text-indigo-600 animate-pulse" />

                <div>
                  <span className="text-sm text-indigo-700">
                    Uploading media...
                  </span>

                  <p className="text-xs text-indigo-500 mt-0.5">
                    The actual file is being
                    uploaded to the backend.
                  </p>
                </div>
              </div>
            )}

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
                        : uploadedMedia[0]
                            ?.media_type}
                    </p>
                  </div>
                </div>
              )}

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
                        ? 'Multiple images will be sent as an Instagram carousel.'
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
                    media.length ===
                      1
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

                        {isCarousel && (
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center">
                            {index +
                              1}
                          </div>
                        )}

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
              </div>
            )}

            {media.length ===
              0 && (
              <div
                onDragOver={(
                  event
                ) => {
                  event.preventDefault();
                  setIsDragging(
                    true
                  );
                }}
                onDragLeave={() =>
                  setIsDragging(
                    false
                  )
                }
                onDrop={(
                  event
                ) => {
                  event.preventDefault();

                  setIsDragging(
                    false
                  );

                  handleFileSelect(
                    event
                      .dataTransfer
                      .files
                  );
                }}
                onClick={() => {
                  if (
                    !uploading &&
                    !publishing
                  ) {
                    fileInputRef.current?.click();
                  }
                }}
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
                  Image: Instagram,
                  Facebook, LinkedIn
                  <br />
                  Video: Instagram,
                  Facebook, LinkedIn,
                  YouTube
                  <br />
                  Carousel: 2–10 images
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
                    disabled={
                      isDraftMode ||
                      publishing
                    }
                    value={
                      scheduleDate
                    }
                    onChange={(
                      event
                    ) =>
                      setScheduleDate(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
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
                    disabled={
                      isDraftMode ||
                      publishing
                    }
                    value={
                      scheduleTime
                    }
                    onChange={(
                      event
                    ) =>
                      setScheduleTime(
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Campaign (optional)
              </label>

              <input
                type="text"
                placeholder="Campaign integration will be connected later..."
                value={
                  campaign
                }
                onChange={(
                  event
                ) =>
                  setCampaign(
                    event
                      .target
                      .value
                  )
                }
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

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

          <div className="flex gap-3">
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
              Schedule Post
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6">
            <ContentPreview
              content={
                content
              }
              mediaUrl={
                media.length >
                0
                  ? media[0]
                      .url
                  : null
              }
              mediaType={
                media.length >
                0
                  ? media[0]
                      .type
                  : 'text'
              }
              platform={
                getSelectedPlatform() ||
                'facebook'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;