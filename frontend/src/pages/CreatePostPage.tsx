<<<<<<< HEAD
import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Check,
  Clock,
  Image as ImageIcon,
  Paperclip,
  Send,
  Smile,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa6";

type Platform =
  | "Facebook"
  | "Instagram"
  | "LinkedIn";

interface MediaFile {
  name: string;
  url: string;
  type: string;
}

const MAX_CHARACTERS = 280;

export default function CreatePostPage() {
  const navigate =  useNavigate();

  const [selectedPlatforms, setSelectedPlatforms] =
    useState<Platform[]>(["Facebook"]);

  const [content, setContent] = useState("");
  const [postTitle, setPostTitle] = useState("");

  const [media, setMedia] =
    useState<MediaFile[]>([]);

  const [scheduleDate, setScheduleDate] =
    useState("");

  const [scheduleTime, setScheduleTime] =
    useState("");

  const [campaign, setCampaign] =
    useState("No Campaign");

  const [saveAsDraft, setSaveAsDraft] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const charactersLeft =
    MAX_CHARACTERS - content.length;

  const platforms = [
    {
      name: "Facebook" as Platform,
      icon: FaFacebookF,
      color: "facebook",
    },
    {
      name: "Instagram" as Platform,
      icon: FaInstagram,
      color: "instagram",
    },
    {
      name: "LinkedIn" as Platform,
      icon: FaLinkedinIn,
      color: "linkedin",
    },
  ];

  const showMessage = (message: string) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const togglePlatform = (
    platform: Platform
  ) => {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter(
          (item) => item !== platform
        );
      }

      return [...current, platform];
    });
  };

  const handleContentChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    if (value.length <= MAX_CHARACTERS) {
      setContent(value);
    }
  };

  const addEmoji = () => {
    const emoji = " 😊";

    if (
      content.length + emoji.length <=
      MAX_CHARACTERS
    ) {
      setContent(
        (current) => current + emoji
      );
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;

    if (!files) {
      return;
    }

    const newFiles: MediaFile[] =
      Array.from(files)
        .filter(
          (file) =>
            file.type.startsWith("image/") ||
            file.type.startsWith("video/")
        )
        .map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        }));

    setMedia((current) => [
      ...current,
      ...newFiles,
    ]);

    event.target.value = "";
  };

  const handleDrop = (
    event: DragEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    const files =
      event.dataTransfer.files;

    if (!files.length) {
      return;
    }

    const newFiles: MediaFile[] =
      Array.from(files)
        .filter(
          (file) =>
            file.type.startsWith("image/") ||
            file.type.startsWith("video/")
        )
        .map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        }));

    setMedia((current) => [
      ...current,
      ...newFiles,
    ]);
  };

  const removeMedia = (index: number) => {
    setMedia((current) => {
      const selectedFile = current[index];

      if (selectedFile) {
        URL.revokeObjectURL(
          selectedFile.url
        );
      }

      return current.filter(
        (_, fileIndex) =>
          fileIndex !== index
      );
    });
  };

  const handleClear = () => {
    media.forEach((file) => {
      URL.revokeObjectURL(file.url);
    });

    setSelectedPlatforms(["Facebook"]);
    setContent("");
    setPostTitle("");
    setMedia([]);
    setScheduleDate("");
    setScheduleTime("");
    setCampaign("No Campaign");
    setSaveAsDraft(false);
    setSuccessMessage("");
  };

  const handleSaveDraft = () => {
    setSaveAsDraft(true);
    showMessage(
      "Post saved as draft successfully."
    );
  };

  const handlePublish = () => {
    if (
      !content.trim() &&
      media.length === 0
    ) {
      showMessage(
        "Please add post content or media first."
=======
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Plus,
} from 'lucide-react';

import { Card, Button } from '../components/ui';
import { ContentPreview } from '../components/ContentPreview';
import api, {
  accountService,
  postService,
  PostUpdatePayload,
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

type Campaign = {
  id: number | string;
  name?: string;
  campaign_name?: string;
  title?: string;
  description?: string;
  status?: string;
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

type PostMediaType = 'text' | 'image' | 'video' | 'carousel';

const IMAGE_PLATFORMS = ['facebook', 'instagram', 'linkedin'];
const VIDEO_PLATFORMS = ['facebook', 'instagram', 'linkedin', 'youtube'];
const CAROUSEL_PLATFORMS = ['facebook', 'instagram', 'linkedin'];

const MAX_CAROUSEL_IMAGES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const normalizePlatform = (platform?: string): string => {
  const normalized = platform?.toLowerCase().trim() || '';
  return normalized === 'twitter' ? 'x' : normalized;
};

const isImagePlatform = (platform: string) =>
  IMAGE_PLATFORMS.includes(normalizePlatform(platform));

const isVideoPlatform = (platform: string) =>
  VIDEO_PLATFORMS.includes(normalizePlatform(platform));

const isCarouselPlatform = (platform: string) =>
  CAROUSEL_PLATFORMS.includes(normalizePlatform(platform));

const isValidRemoteUrl = (value?: string | null): boolean => {
  if (!value) return false;

  if (value.startsWith('blob:') || value.includes('blob:')) {
    return false;
  }

  return value.startsWith('https://') || value.startsWith('http://');
};

export function CreatePostPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  /*
   * false = append images
   * true  = replace all existing images
   */
  const imagePickerReplaceRef = useRef(false);

  const [content, setContent] = useState('');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<
    (number | string)[]
  >([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);

  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(
    null
  );
  const [existingMediaType, setExistingMediaType] =
    useState<PostMediaType | null>(null);
  const [existingMediaRemoved, setExistingMediaRemoved] = useState(false);

  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isDraftMode, setIsDraftMode] = useState(false);

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingPost, setLoadingPost] = useState(isEditMode);

  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const maxLength = 280;
  const remaining = maxLength - content.length;

  useEffect(() => {
    loadAccounts();
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (editId) {
      loadPostForEdit(editId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  useEffect(() => {
    return () => {
      media.forEach((item) => {
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [media]);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      setError('');

      const response = await accountService.getAll();

      const data = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.items ||
          (response.data as any)?.accounts ||
          [];

      const connectedOnly = data.filter(
        (account: SocialAccount) => account.is_connected === true
      );

      setAccounts(connectedOnly);
    } catch (err: any) {
      console.error('Failed to load social accounts:', err);

      setError(
        err.response?.data?.detail ||
          'Failed to load connected social accounts.'
      );
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      setLoadingCampaigns(true);

      const response = await api.get('/campaigns/');

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.items ||
          response.data?.campaigns ||
          response.data?.data ||
          [];

      const normalizedCampaigns: Campaign[] = Array.isArray(data)
        ? data
            .filter(
              (campaign: any) =>
                campaign &&
                campaign.id !== undefined &&
                campaign.id !== null
            )
            .map((campaign: any) => ({
              id: campaign.id,
              name:
                campaign.name ||
                campaign.campaign_name ||
                campaign.title ||
                `Campaign ${campaign.id}`,
              campaign_name: campaign.campaign_name,
              title: campaign.title,
              description: campaign.description,
              status: campaign.status,
            }))
        : [];

      setCampaigns(normalizedCampaigns);
    } catch (err: any) {
      console.error('Failed to load campaigns:', err);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const getCampaignDisplayName = (campaign: Campaign) =>
    campaign.name ||
    campaign.campaign_name ||
    campaign.title ||
    `Campaign ${campaign.id}`;

  const loadPostForEdit = async (id: string) => {
    try {
      setLoadingPost(true);
      setError('');

      const response = await postService.getById(id);
      const post = response.data;

      setContent(post.content || '');

      if (Array.isArray(post.social_account_ids)) {
        setSelectedAccountIds(post.social_account_ids);
      } else if (Array.isArray(post.social_accounts)) {
        setSelectedAccountIds(
          post.social_accounts
            .map(
              (item: any) =>
                item.social_account_id ??
                item.social_account?.id ??
                item.id
            )
            .filter(Boolean)
        );
      }

      if (post.campaign_id !== undefined && post.campaign_id !== null) {
        setSelectedCampaignId(String(post.campaign_id));
      }

      if (post.status) {
        setIsDraftMode(post.status === 'draft');
      }

      if (post.scheduled_time) {
        const [datePart, timePart] = String(post.scheduled_time).split('T');

        if (datePart) setScheduleDate(datePart);
        if (timePart) setScheduleTime(timePart.slice(0, 5));
      }

      if (post.media_url) {
        setExistingMediaUrl(post.media_url);
        setExistingMediaType(
          (post.media_type as PostMediaType) || null
        );
      }
    } catch (err: any) {
      console.error('Failed to load post for editing:', err);

      setError(
        err.response?.data?.detail ||
          'Unable to load the post you are trying to edit.'
      );
    } finally {
      setLoadingPost(false);
    }
  };

  const toggleAccount = (accountId: number | string) => {
    setSelectedAccountIds((previous) =>
      previous.includes(accountId)
        ? previous.filter((id) => id !== accountId)
        : [...previous, accountId]
    );
  };

  const getAccountDisplayName = (account: SocialAccount) =>
    account.handle ||
    account.username ||
    account.account_name ||
    account.name ||
    'Connected account';

  const getPlatformName = (platform: string) => {
    const config = getPlatformConfig(platform);
    return config?.name || platform;
  };

  const getSelectedPlatforms = (): string[] =>
    Array.from(
      new Set(
        accounts
          .filter((account) => selectedAccountIds.includes(account.id))
          .map((account) => normalizePlatform(account.platform))
      )
    );

  const getSelectedPlatform = (): string | null => {
    const platforms = getSelectedPlatforms();
    return platforms.length === 0 ? null : platforms[0];
  };

  const validateMediaAgainstPlatforms = (files: File[]) => {
    const selectedPlatforms = getSelectedPlatforms();

    if (selectedPlatforms.length === 0) {
      throw new Error(
        'Please select at least one connected social account before uploading media.'
      );
    }

    const hasVideo = files.some((file) => file.type.startsWith('video/'));
    const hasImage = files.some((file) => file.type.startsWith('image/'));

    if (hasVideo && hasImage) {
      throw new Error('Please select either images or a video, not both.');
    }

    if (hasVideo) {
      if (files.length !== 1) {
        throw new Error('Only one video can be uploaded at a time.');
      }

      const unsupported = selectedPlatforms.filter(
        (platform) => !isVideoPlatform(platform)
      );

      if (unsupported.length > 0) {
        throw new Error(
          'Video publishing is supported only for Instagram, Facebook, LinkedIn, and YouTube.'
        );
      }
    }

    if (hasImage) {
      if (files.length === 1) {
        const unsupported = selectedPlatforms.filter(
          (platform) => !isImagePlatform(platform)
        );

        if (unsupported.length > 0) {
          throw new Error(
            'Image publishing is supported only for Instagram, Facebook, and LinkedIn.'
          );
        }
      }

      if (files.length >= 2) {
        const unsupported = selectedPlatforms.filter(
          (platform) => !isCarouselPlatform(platform)
        );

        if (unsupported.length > 0) {
          throw new Error(
            'Carousel publishing is supported only for Instagram, Facebook, and LinkedIn. Please remove YouTube before creating a carousel.'
          );
        }
      }
    }
  };

  const validateFiles = (files: File[]) => {
    if (files.length === 0) return;

    const imageFiles = files.filter((file) =>
      file.type.startsWith('image/')
    );

    const videoFiles = files.filter((file) =>
      file.type.startsWith('video/')
    );

    if (imageFiles.length + videoFiles.length !== files.length) {
      throw new Error('Only image and video files are supported.');
    }

    if (videoFiles.length > 0 && files.length > 1) {
      throw new Error('Only one video can be uploaded at a time.');
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`${file.name} is larger than 50 MB.`);
      }
    }

    validateMediaAgainstPlatforms(files);
  };

  const uploadMediaToBackend = async (
    file: File
  ): Promise<UploadedMedia> => {
    const selectedPlatforms = getSelectedPlatforms();

    if (selectedPlatforms.length === 0) {
      throw new Error('No social platform selected.');
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      throw new Error('Only image and video files are supported.');
    }

    const uploadPlatform = isVideo
      ? selectedPlatforms.find((platform) => isVideoPlatform(platform))
      : selectedPlatforms.find((platform) => isImagePlatform(platform));

    if (!uploadPlatform) {
      throw new Error(
        isVideo
          ? 'No supported platform is selected for video publishing.'
          : 'No supported platform is selected for image publishing.'
      );
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/uploads/?platform=${encodeURIComponent(uploadPlatform)}`,
      formData
    );

    const uploadedUrl = response.data?.media_url;
    const uploadedType = response.data?.media_type;

    if (!isValidRemoteUrl(uploadedUrl)) {
      throw new Error(
        `Backend did not return a valid media URL for ${file.name}.`
      );
    }

    return {
      media_url: uploadedUrl,
      media_type:
        uploadedType || (isVideo ? 'video' : 'image'),
      filename: response.data?.filename || file.name,
    };
  };

  const uploadSelectedFiles = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return [];

    try {
      setError('');
      setSuccess(false);
      setUploading(true);
      setUploadProgress(0);

      const uploadedResults: UploadedMedia[] = [];

      for (let index = 0; index < selectedFiles.length; index++) {
        const uploaded = await uploadMediaToBackend(selectedFiles[index]);

        uploadedResults.push(uploaded);

        setUploadProgress(
          Math.round(((index + 1) / selectedFiles.length) * 100)
        );
      }

      const normalizedResults = uploadedResults.map((item) => ({
        ...item,
        media_type:
          uploadedResults.length >= 2
            ? ('carousel' as const)
            : item.media_type,
      }));

      setUploadedMedia((previous) => [
        ...previous,
        ...normalizedResults,
      ]);

      return normalizedResults;
    } catch (err: any) {
      console.error('Media upload error:', err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item: any) =>
                item.msg || 'Media upload validation error'
            )
            .join(', ')
        );
      } else {
        setError(
          detail || err.message || 'Unable to upload media.'
        );
      }

      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleImageFiles = async (
    files: File[],
    replaceExisting = false
  ) => {
    if (files.length === 0) return;

    try {
      setError('');
      setSuccess(false);

      const imageFiles = files.filter((file) =>
        file.type.startsWith('image/')
      );

      if (imageFiles.length !== files.length) {
        throw new Error('Please select image files only.');
      }

      const currentImageCount = replaceExisting
        ? 0
        : media.filter((item) => item.type === 'image').length;

      const totalAfterSelection =
        currentImageCount + imageFiles.length;

      if (totalAfterSelection > MAX_CAROUSEL_IMAGES) {
        throw new Error(
          `A carousel can contain a maximum of ${MAX_CAROUSEL_IMAGES} images. You already have ${currentImageCount} image(s) selected.`
        );
      }

      validateFiles(imageFiles);

      /*
       * IMPORTANT:
       * Create a preview for EVERY selected File.
       *
       * If Windows returns 5 files from the picker,
       * this creates 5 preview items.
       */
      const previewItems: MediaItem[] = imageFiles.map((file) => ({
        type: 'image',
        url: URL.createObjectURL(file),
        name: file.name,
        file,
      }));

      if (replaceExisting) {
        media.forEach((item) => {
          if (item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url);
          }
        });

        setMedia(previewItems);
        setUploadedMedia([]);
      } else {
        setMedia((previous) => [
          ...previous,
          ...previewItems,
        ]);
      }

      setExistingMediaRemoved(true);

      await uploadSelectedFiles(imageFiles);
    } catch (err: any) {
      console.error('Image selection error:', err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          'Unable to select images.'
      );
    }
  };

  const handleVideoFile = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setError('');
      setSuccess(false);

      if (files.length > 1) {
        throw new Error('Please select only one video.');
      }

      validateFiles(files);

      media.forEach((item) => {
        if (item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      });

      setMedia([]);
      setUploadedMedia([]);
      setExistingMediaRemoved(true);

      const file = files[0];

      const previewItem: MediaItem = {
        type: 'video',
        url: URL.createObjectURL(file),
        name: file.name,
        file,
      };

      setMedia([previewItem]);

      await uploadSelectedFiles([file]);
    } catch (err: any) {
      console.error('Video selection error:', err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          'Unable to select video.'
      );
    }
  };

  const handleFileDrop = async (files: File[]) => {
    if (files.length === 0) return;

    const hasVideo = files.some((file) =>
      file.type.startsWith('video/')
    );

    const hasImage = files.some((file) =>
      file.type.startsWith('image/')
    );

    if (hasVideo && hasImage) {
      setError('Please drop either images or one video, not both.');
      return;
    }

    if (hasVideo) {
      await handleVideoFile(files);
      return;
    }

    await handleImageFiles(files, media.length === 0);
  };

  const removeMedia = (index: number) => {
    const item = media[index];

    if (item?.url.startsWith('blob:')) {
      URL.revokeObjectURL(item.url);
    }

    setMedia((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );

    setUploadedMedia((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const removeAllMedia = () => {
    media.forEach((item) => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });

    setMedia([]);
    setUploadedMedia([]);
    setUploadProgress(0);
  };

  const removeExistingMedia = () => {
    setExistingMediaRemoved(true);
    setExistingMediaUrl(null);
    setExistingMediaType(null);
  };

  /*
   * IMAGE PICKER
   *
   * This is the important part.
   *
   * We reset the input BEFORE opening it.
   * We DO NOT reset it from onClick.
   *
   * The input itself has `multiple`, allowing
   * Windows to return multiple selected files.
   */
  const openImagePicker = (replaceExisting = false) => {
    if (
      uploading ||
      publishing ||
      selectedAccountIds.length === 0
    ) {
      return;
    }

    imagePickerReplaceRef.current = replaceExisting;

    const input = imageInputRef.current;

    if (!input) return;

    input.value = '';
    input.click();
  };

  const openVideoPicker = () => {
    if (
      uploading ||
      publishing ||
      selectedAccountIds.length === 0
    ) {
      return;
    }

    const input = videoInputRef.current;

    if (!input) return;

    input.value = '';
    input.click();
  };

  const handleCancelForm = () => {
    if (publishing || uploading) return;

    if (isEditMode) {
      navigate('/app/posts');
      return;
    }

    media.forEach((item) => {
      if (item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
    });

    setContent('');
    setMedia([]);
    setUploadedMedia([]);
    setScheduleDate('');
    setScheduleTime('');
    setSelectedCampaignId('');
    setIsDraftMode(false);
    setSelectedAccountIds([]);
    setError('');
    setSuccess(false);
    setIsDragging(false);
    setUploadProgress(0);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handlePostSubmission = async (
    overrideDraftMode?: boolean
  ) => {
    setError('');
    setSuccess(false);

    const activeDraftMode =
      overrideDraftMode !== undefined
        ? overrideDraftMode
        : isDraftMode;

    if (!content.trim()) {
      setError('Please write some content for your post.');
      return;
    }

    if (content.length > maxLength) {
      setError(
        `Post content cannot exceed ${maxLength} characters.`
      );
      return;
    }

    if (selectedAccountIds.length === 0) {
      setError('Select at least one connected social account.');
      return;
    }

    const selectedPlatforms = getSelectedPlatforms();

    if (selectedPlatforms.length === 0) {
      setError(
        'Unable to determine the selected social platforms.'
>>>>>>> origin/shravanik-latest-scheduler
      );
      return;
    }

    if (
<<<<<<< HEAD
      scheduleDate &&
      scheduleTime
    ) {
      showMessage(
        "Post scheduled successfully."
      );
    } else {
      showMessage(
        "Post published successfully."
      );
    }
  };

  return (
    <div className="cp-page">

      <aside className="cp-sidebar">

        <div className="cp-brand">
          <div className="cp-brand-logo">
            ⚡
          </div>

          <div>
            <div className="cp-brand-name">
              SocialPilot
            </div>

            <div className="cp-brand-subtitle">
              Campaign Manager
            </div>
          </div>
        </div>

        <div className="cp-menu-title">
          CREATE
        </div>

        <nav className="cp-sidebar-menu">

          <button
            type="button"
            className="cp-sidebar-item active"
          >
            <span className="cp-side-icon">
              ＋
            </span>

            <span>
              Create Post
            </span>
          </button>

          <button
  type="button"
  className="cp-sidebar-item"
  onClick={() => navigate("/app/content-library")}
>
            <span className="cp-side-icon">
              ▣
            </span>

            <span>
              Content Library
            </span>
          </button>

          
          

        </nav>

        <div className="cp-sidebar-bottom">

          <div className="cp-upgrade-box">
            <strong>
              Upgrade your plan
            </strong>

            <p>
              Get more features and grow
              faster.
            </p>

            <button type="button">
              Upgrade
            </button>
          </div>

        </div>

      </aside>

      <main className="cp-main">

        <header className="cp-topbar">

          <div className="cp-topbar-title">

            <div className="cp-page-icon">
              <Send />
            </div>

            <div>
              <h1>
                Create Post
              </h1>

              <p>
                SocialPilot Campaign Manager
              </p>
            </div>

          </div>

          <div className="cp-top-actions">

            <button
  type="button"
  className="cp-clear-button"
  onClick={handleClear}
>
  <Trash2 size={18} />
  Clear
</button>

            <div className="cp-profile">

              <div className="cp-avatar">
                A
              </div>

              <div>
                <strong>
                  anika_123
                </strong>

                <small>
                  Team Member
                </small>
              </div>

            </div>

          </div>

        </header>

        {successMessage && (
          <div className="cp-message-wrapper">

            <div
              className={
                successMessage.includes(
                  "Please"
                )
                  ? "cp-message error"
                  : "cp-message success"
              }
            >
              {successMessage}
            </div>

          </div>
        )}

        <div className="cp-content">

          <div className="cp-heading">

            <div>
              <h2>
                Create, preview and schedule
                your social media post
              </h2>

              <p>
                Publish your content across
                connected social media
                platforms.
              </p>
            </div>

            <div className="cp-heading-status">
              <span className="cp-status-dot" />
              Ready to publish
            </div>

          </div>

          <div className="cp-layout">

            <div className="cp-left-column">

              <section className="cp-card">

                <div className="cp-card-header">
                  <div>
                    <h3>
                      Select Platforms
                    </h3>

                    <p>
                      Choose where you want to
                      publish this post.
                    </p>
                  </div>

                  <span className="cp-header-number">
                    {selectedPlatforms.length}
                  </span>
                </div>

                <div className="cp-card-body">

                  <div className="cp-platform-grid">

                    {platforms.map(
                      (platform) => {
                        const Icon =
                          platform.icon;

                        const selected =
                          selectedPlatforms.includes(
                            platform.name
                          );

                        return (
                          <button
                            key={platform.name}
                            type="button"
                            onClick={() =>
                              togglePlatform(
                                platform.name
                              )
                            }
                            className={
                              selected
                                ? "cp-platform selected"
                                : "cp-platform"
                            }
                          >
                            <div
                              className={`cp-platform-icon ${platform.color}`}
                            >
                              <Icon />
                            </div>

                            <div className="cp-platform-name">
                              {
                                platform.name
                              }
                            </div>

                            {selected && (
                              <div className="cp-check">
                                <Check />
                              </div>
                            )}
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>

              </section>

              <section className="cp-card">

                <div className="cp-card-header">
                  <div>
                    <h3>
                      Compose Post
                    </h3>

                    <p>
                      Write your content and
                      add media.
                    </p>
                  </div>
                </div>

                <div className="cp-card-body">

                  <div className="cp-field">

                    <label>
                      Post Title
                    </label>

                    <input
                      type="text"
                      value={postTitle}
                      onChange={(event) =>
                        setPostTitle(
                          event.target.value
                        )
                      }
                      placeholder="Enter post title"
                    />

                  </div>

                  <div className="cp-field">

                    <label>
                      Post Content
                    </label>

                    <div className="cp-textarea-wrapper">

                      <textarea
                        value={content}
                        onChange={
                          handleContentChange
                        }
                        rows={8}
                        placeholder="What do you want to share?"
                      />

                      <div className="cp-textarea-footer">

                        <div className="cp-editor-tools">

                          <button
                            type="button"
                            onClick={addEmoji}
                            title="Add emoji"
                          >
                            <Smile />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            title="Attach media"
                          >
                            <Paperclip />
                          </button>

                        </div>

                        <span
                          className={
                            charactersLeft <
                            20
                              ? "cp-counter danger"
                              : "cp-counter"
                          }
                        >
                          {charactersLeft}{" "}
                          characters left
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="cp-field">

                    <div className="cp-media-title">

                      <label>
                        Images and Videos
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                      >
                        <Upload />
                        Upload
                      </button>

                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={
                        handleFileChange
                      }
                      className="cp-hidden-input"
                    />

                    {media.length === 0 ? (
                      <button
                        type="button"
                        className="cp-upload-box"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        onDragOver={(event) =>
                          event.preventDefault()
                        }
                        onDrop={handleDrop}
                      >
                        <div className="cp-upload-icon">
                          <Upload />
                        </div>

                        <strong>
                          Drag & drop or click
                          to upload
                        </strong>

                        <span>
                          PNG, JPG, GIF, MP4
                          supported
                        </span>
                      </button>
                    ) : (
                      <div className="cp-media-grid">

                        {media.map(
                          (file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="cp-media-item"
                            >

                              {file.type.startsWith(
                                "video/"
                              ) ? (
                                <video
                                  src={file.url}
                                  controls
                                />
                              ) : (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                />
                              )}

                              <button
                                type="button"
                                className="cp-remove-media"
                                onClick={() =>
                                  removeMedia(
                                    index
                                  )
                                }
                              >
                                <X />
                              </button>

                              <div className="cp-media-name">
                                {file.name}
                              </div>

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </section>

              <section className="cp-card">

                <div className="cp-card-header">
                  <div>
                    <h3>
                      Schedule & Campaign
                    </h3>

                    <p>
                      Choose when and under
                      which campaign to publish.
                    </p>
                  </div>
                </div>

                <div className="cp-card-body">

                  <div className="cp-schedule-grid">

                    <div className="cp-field">

                      <label>
                        Date
                      </label>

                      <div className="cp-input-icon">

                        <Calendar />

                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(event) =>
                            setScheduleDate(
                              event.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                    <div className="cp-field">

                      <label>
                        Time
                      </label>

                      <div className="cp-input-icon">

                        <Clock />

                        <input
                          type="time"
                          value={scheduleTime}
                          onChange={(event) =>
                            setScheduleTime(
                              event.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                    <div className="cp-field cp-full">

                      <label>
                        Campaign
                      </label>

                      <select
                        value={campaign}
                        onChange={(event) =>
                          setCampaign(
                            event.target.value
                          )
                        }
                      >
                        <option>
                          No Campaign
                        </option>

                        <option>
                          Product Launch Q3
                        </option>

                        <option>
                          Brand Awareness
                        </option>

                        <option>
                          Social Proof
                        </option>

                        <option>
                          Brand Campaign
                        </option>
                      </select>

                    </div>

                  </div>

                  <label className="cp-draft-option">

                    <input
                      type="checkbox"
                      checked={saveAsDraft}
                      onChange={(event) =>
                        setSaveAsDraft(
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      Save as draft
                    </span>

                  </label>

                </div>

              </section>

            </div>

            <div className="cp-right-column">

              <section className="cp-preview-card">

                <div className="cp-preview-header">

                  <div>
                    <h3>
                      Post Preview
                    </h3>

                    <p>
                      Preview how your post
                      will look.
                    </p>
                  </div>

                  <span>
                    {selectedPlatforms.length}{" "}
                    platform
                    {selectedPlatforms.length !==
                    1
                      ? "s"
                      : ""}
                  </span>

                </div>

                <div className="cp-preview-body">

                  <div className="cp-preview-profile">

                    <div className="cp-preview-avatar">
                      A
                    </div>

                    <div>
                      <strong>
                        anika_123
                      </strong>

                      <small>
                        Just now
                      </small>
                    </div>

                  </div>

                  {postTitle && (
                    <h4 className="cp-preview-title">
                      {postTitle}
                    </h4>
                  )}

                  <p className="cp-preview-content">
                    {content ||
                      "Your post content will appear here..."}
                  </p>

                  {media.length > 0 && (
                    <div className="cp-preview-media">

                      {media[0].type.startsWith(
                        "video/"
                      ) ? (
                        <video
                          src={media[0].url}
                          controls
                        />
                      ) : (
                        <img
                          src={media[0].url}
                          alt={media[0].name}
                        />
                      )}

                      {media.length > 1 && (
                        <div className="cp-media-count">
                          +{media.length - 1}
                        </div>
                      )}

                    </div>
                  )}

                  <div className="cp-preview-actions">

                    <span>
                      ♡ Like
                    </span>

                    <span>
                      ◯ Comment
                    </span>

                    <span>
                      ⌯ Share
                    </span>

                  </div>

                </div>

              </section>

              <section className="cp-summary-card">

                <div className="cp-summary-header">
                  <h3>
                    Publishing Summary
                  </h3>
                </div>

                <div className="cp-summary-list">

                  <div>
                    <span>
                      Platforms
                    </span>

                    <strong>
                      {selectedPlatforms.join(
                        ", "
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Content
                    </span>

                    <strong>
                      {content.length} /{" "}
                      {MAX_CHARACTERS}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Media
                    </span>

                    <strong>
                      {media.length} file
                      {media.length !== 1
                        ? "s"
                        : ""}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Campaign
                    </span>

                    <strong>
                      {campaign}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Publishing
                    </span>

                    <strong>
                      {scheduleDate &&
                      scheduleTime
                        ? "Scheduled"
                        : saveAsDraft
                        ? "Draft"
                        : "Publish now"}
                    </strong>
                  </div>

                </div>

              </section>

              <section className="cp-tip-card">

                <div className="cp-tip-icon">
                  💡
                </div>

                <div>
                  <strong>
                    Publishing tip
                  </strong>

                  <p>
                    Add an image or video to
                    make your post more
                    engaging across social
                    platforms.
                  </p>
                </div>

              </section>

              <div className="cp-action-buttons">

                <button
                  type="button"
                  className="cp-draft-button"
                  onClick={
                    handleSaveDraft
                  }
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  className="cp-publish-button"
                  onClick={
                    handlePublish
                  }
                >
                  <Send />
                  {scheduleDate &&
                  scheduleTime
                    ? "Schedule Post"
                    : "Publish Post"}
                </button>

              </div>

            </div>

          </div>

        </div>

        <style>{`

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          button,
          input,
          textarea,
          select {
            font-family: inherit;
          }

          button {
            cursor: pointer;
          }

          .cp-page {
            min-height: 100vh;
            background:
              linear-gradient(
                135deg,
                #eff6ff 0%,
                #f8fbff 48%,
                #ecfeff 100%
              );
            color: #172033;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .cp-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 250px;
            background: #ffffff;
            border-right: 1px solid #dbe5f0;
            display: flex;
            flex-direction: column;
            z-index: 20;
          }

          .cp-brand {
            height: 82px;
            padding: 18px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid #e7eef7;
          }

          .cp-brand-logo {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background:
              linear-gradient(
                135deg,
                #2563eb,
                #06b6d4
              );
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 900;
            box-shadow:
              0 7px 18px
              rgba(37, 99, 235, 0.22);
          }

          .cp-brand-name {
            font-size: 17px;
            font-weight: 800;
            color: #172033;
          }

          .cp-brand-subtitle {
            margin-top: 2px;
            font-size: 11px;
            color: #64748b;
          }

          .cp-menu-title {
            padding: 24px 20px 10px;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.2px;
            color: #94a3b8;
          }

          .cp-sidebar-menu {
            padding: 0 12px;
          }

          .cp-sidebar-item {
            width: 100%;
            border: 0;
            background: transparent;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 10px;
            margin-bottom: 4px;
            font-size: 13px;
            font-weight: 700;
            text-align: left;
            transition: 0.2s ease;
          }

          .cp-sidebar-item:hover {
            background: #eff6ff;
            color: #2563eb;
          }

          .cp-sidebar-item.active {
            background:
              linear-gradient(
                90deg,
                #dbeafe,
                #eff6ff
              );
            color: #1d4ed8;
            box-shadow:
              inset 3px 0 0 #2563eb;
          }

          .cp-side-icon {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
          }

          .cp-sidebar-bottom {
            margin-top: auto;
            padding: 16px;
          }

          .cp-upgrade-box {
            padding: 17px;
            border-radius: 14px;
            background:
              linear-gradient(
                135deg,
                #eff6ff,
                #ecfeff
              );
            border: 1px solid #dbeafe;
          }

          .cp-upgrade-box strong {
            color: #1e3a8a;
            font-size: 13px;
          }

          .cp-upgrade-box p {
            margin: 6px 0 12px;
            color: #64748b;
            font-size: 11px;
            line-height: 1.5;
          }

          .cp-upgrade-box button {
            width: 100%;
            border: 0;
            border-radius: 8px;
            background: #2563eb;
            color: #ffffff;
            padding: 9px;
            font-size: 12px;
            font-weight: 800;
          }

          .cp-main {
            min-height: 100vh;
            margin-left: 250px;
          }

          .cp-topbar {
            min-height: 82px;
            padding: 16px 28px;
            background: #ffffff;
            border-bottom: 1px solid #dbe5f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .cp-topbar-title {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .cp-page-icon {
            width: 43px;
            height: 43px;
            border-radius: 11px;
            background: #eff6ff;
            color: #2563eb;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cp-page-icon svg {
            width: 21px;
            height: 21px;
          }

          .cp-topbar-title h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            color: #111827;
          }

          .cp-topbar-title p {
            margin: 3px 0 0;
            color: #64748b;
            font-size: 11px;
          }

          .cp-top-actions {
            display: flex;
            align-items: center;
            gap: 18px;
          }

          .cp-clear-button {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            border: 1px solid #dbe3ee;
            background: #ffffff;
            color: #475569;
            border-radius: 9px;
            padding: 9px 13px;
            font-size: 12px;
            font-weight: 700;
          }

          .cp-clear-button:hover {
            background: #fff1f2;
            color: #dc2626;
            border-color: #fecdd3;
          }

          .cp-clear-button svg {
            width: 15px;
            height: 15px;
          }

          .cp-profile {
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .cp-avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background:
              linear-gradient(
                135deg,
                #2563eb,
                #06b6d4
              );
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
          }

          .cp-profile strong,
          .cp-profile small {
            display: block;
          }

          .cp-profile strong {
            font-size: 12px;
            color: #334155;
          }

          .cp-profile small {
            margin-top: 2px;
            color: #94a3b8;
            font-size: 10px;
          }

          .cp-message-wrapper {
            max-width: 1250px;
            margin: 0 auto;
            padding: 18px 28px 0;
          }

          .cp-message {
            border-radius: 10px;
            padding: 12px 15px;
            font-size: 12px;
            font-weight: 700;
          }

          .cp-message.success {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1d4ed8;
          }

          .cp-message.error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
          }

          .cp-content {
            max-width: 1250px;
            margin: 0 auto;
            padding: 28px;
          }

          .cp-heading {
            margin-bottom: 22px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .cp-heading h2 {
            margin: 0;
            color: #1e293b;
            font-size: 24px;
            font-weight: 800;
          }

          .cp-heading p {
            margin: 6px 0 0;
            color: #64748b;
            font-size: 13px;
          }

          .cp-heading-status {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 8px 12px;
            border-radius: 20px;
            background: #ecfdf5;
            border: 1px solid #bbf7d0;
            color: #047857;
            font-size: 11px;
            font-weight: 800;
          }

          .cp-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
          }

          .cp-layout {
            display: grid;
            grid-template-columns:
              minmax(0, 1.35fr)
              minmax(330px, 0.65fr);
            gap: 22px;
            align-items: start;
          }

          .cp-left-column,
          .cp-right-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .cp-card,
          .cp-preview-card,
          .cp-summary-card,
          .cp-tip-card {
            background: #ffffff;
            border: 1px solid #dbe5f0;
            border-radius: 15px;
            overflow: hidden;
            box-shadow:
              0 7px 22px
              rgba(15, 23, 42, 0.055);
          }

          .cp-card-header,
          .cp-preview-header,
          .cp-summary-header {
            padding: 17px 19px;
            border-bottom: 1px solid #e5edf6;
            background:
              linear-gradient(
                90deg,
                #f8fbff,
                #ffffff
              );
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
          }

          .cp-card-header h3,
          .cp-preview-header h3,
          .cp-summary-header h3 {
            margin: 0;
            color: #1e293b;
            font-size: 16px;
            font-weight: 800;
          }

          .cp-card-header p,
          .cp-preview-header p {
            margin: 4px 0 0;
            color: #64748b;
            font-size: 11px;
          }

          .cp-header-number {
            min-width: 29px;
            height: 29px;
            border-radius: 50%;
            background: #dbeafe;
            color: #1d4ed8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
          }

          .cp-card-body {
            padding: 19px;
          }

          .cp-platform-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 11px;
          }

          .cp-platform {
            position: relative;
            min-height: 88px;
            border: 1px solid #dbe3ed;
            border-radius: 12px;
            background: #ffffff;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 13px;
            text-align: left;
            transition: 0.2s ease;
          }

          .cp-platform:hover {
            border-color: #93c5fd;
            background: #f8fbff;
          }

          .cp-platform.selected {
            border-color: #60a5fa;
            background: #eff6ff;
            box-shadow:
              0 5px 15px
              rgba(37, 99, 235, 0.08);
          }

          .cp-platform-icon {
            width: 39px;
            height: 39px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
          }

          .cp-platform-icon svg {
            width: 19px;
            height: 19px;
          }

          .cp-platform-icon.facebook {
            color: #2563eb;
            background: #dbeafe;
          }

          .cp-platform-icon.instagram {
            color: #db2777;
            background: #fce7f3;
          }

          .cp-platform-icon.linkedin {
            color: #0a66c2;
            background: #dbeafe;
          }

          .cp-platform-name {
            color: #334155;
            font-size: 12px;
            font-weight: 800;
          }

          .cp-check {
            position: absolute;
            right: 9px;
            top: 9px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #2563eb;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cp-check svg {
            width: 12px;
            height: 12px;
          }

          .cp-field {
            margin-bottom: 17px;
          }

          .cp-field:last-child {
            margin-bottom: 0;
          }

          .cp-field label {
            display: block;
            margin-bottom: 7px;
            color: #334155;
            font-size: 12px;
            font-weight: 800;
          }

          .cp-field input,
          .cp-field select {
            width: 100%;
            height: 43px;
            border: 1px solid #d5dee9;
            border-radius: 9px;
            background: #ffffff;
            padding: 0 12px;
            color: #334155;
            font-size: 12px;
            outline: none;
          }

          .cp-field input:focus,
          .cp-field select:focus {
            border-color: #3b82f6;
            box-shadow:
              0 0 0 3px
              rgba(59, 130, 246, 0.1);
          }

          .cp-textarea-wrapper {
            overflow: hidden;
            border: 1px solid #d5dee9;
            border-radius: 10px;
            background: #ffffff;
          }

          .cp-textarea-wrapper:focus-within {
            border-color: #3b82f6;
            box-shadow:
              0 0 0 3px
              rgba(59, 130, 246, 0.1);
          }

          .cp-textarea-wrapper textarea {
            width: 100%;
            min-height: 175px;
            resize: vertical;
            border: 0;
            outline: 0;
            padding: 13px;
            color: #334155;
            font-size: 12px;
            line-height: 1.6;
          }

          .cp-textarea-wrapper textarea::placeholder {
            color: #94a3b8;
          }

          .cp-textarea-footer {
            min-height: 43px;
            padding: 5px 8px;
            border-top: 1px solid #e5edf6;
            background: #f8fbff;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .cp-editor-tools {
            display: flex;
            gap: 2px;
          }

          .cp-editor-tools button {
            width: 31px;
            height: 31px;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: #2563eb;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cp-editor-tools button:hover {
            background: #ffffff;
          }

          .cp-editor-tools svg {
            width: 17px;
            height: 17px;
          }

          .cp-counter {
            color: #2563eb;
            font-size: 10px;
            font-weight: 700;
          }

          .cp-counter.danger {
            color: #dc2626;
          }

          .cp-media-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 7px;
          }

          .cp-media-title label {
            margin: 0;
          }

          .cp-media-title button {
            border: 0;
            background: transparent;
            color: #2563eb;
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 5px;
            font-size: 11px;
            font-weight: 800;
          }

          .cp-media-title svg {
            width: 14px;
            height: 14px;
          }

          .cp-hidden-input {
            display: none !important;
          }

          .cp-upload-box {
            width: 100%;
            min-height: 165px;
            border: 2px dashed #93c5fd;
            border-radius: 12px;
            background:
              linear-gradient(
                135deg,
                #eff6ff,
                #ecfeff
              );
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #475569;
          }

          .cp-upload-box:hover {
            border-color: #2563eb;
            background: #eff6ff;
          }

          .cp-upload-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 10px;
            border-radius: 12px;
            background: #2563eb;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
              0 8px 18px
              rgba(37, 99, 235, 0.2);
          }

          .cp-upload-icon svg {
            width: 23px;
            height: 23px;
          }

          .cp-upload-box strong {
            font-size: 12px;
          }

          .cp-upload-box span {
            margin-top: 5px;
            color: #94a3b8;
            font-size: 10px;
          }

          .cp-media-grid {
            display: grid;
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
            gap: 9px;
          }

          .cp-media-item {
            position: relative;
            overflow: hidden;
            min-height: 120px;
            border: 1px solid #dbeafe;
            border-radius: 10px;
            background: #eff6ff;
          }

          .cp-media-item img,
          .cp-media-item video {
            display: block;
            width: 100%;
            height: 120px;
            object-fit: cover;
          }

          .cp-remove-media {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 25px;
            height: 25px;
            border: 0;
            border-radius: 50%;
            background: #dc2626;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cp-remove-media svg {
            width: 13px;
            height: 13px;
          }

          .cp-media-name {
            overflow: hidden;
            padding: 6px 7px;
            color: #475569;
            font-size: 9px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .cp-schedule-grid {
            display: grid;
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 15px;
          }

          .cp-full {
            grid-column: 1 / -1;
          }

          .cp-input-icon {
            position: relative;
          }

          .cp-input-icon svg {
            position: absolute;
            left: 12px;
            top: 50%;
            width: 15px;
            height: 15px;
            transform: translateY(-50%);
            color: #2563eb;
            pointer-events: none;
          }

          .cp-input-icon input {
            padding-left: 36px;
          }

          .cp-draft-option {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
          }

          .cp-draft-option input {
            width: 15px;
            height: 15px;
            accent-color: #2563eb;
          }

          .cp-preview-header > span {
            padding: 5px 9px;
            border-radius: 15px;
            background: #eef6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
        }

        .cp-preview-body {
          padding: 20px;
        }

        .cp-preview-title {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
        }

        .cp-preview-content {
          min-height: 100px;
          color: #475569;
          font-size: 14px;
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .cp-preview-empty {
          color: #94a3b8;
          font-size: 14px;
          font-style: italic;
        }

        .cp-preview-media {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .cp-preview-media-item {
          position: relative;
          overflow: hidden;
          min-height: 140px;
          border: 1px solid #dbeafe;
          border-radius: 14px;
          background: #f8fafc;
        }

        .cp-preview-media-item img,
        .cp-preview-media-item video {
          display: block;
          width: 100%;
          height: 180px;
          object-fit: cover;
        }

        .cp-preview-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 18px;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .cp-preview-footer-text {
          color: #64748b;
          font-size: 12px;
        }

        .cp-preview-platforms {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cp-platform-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 700;
        }

        .cp-platform-badge.instagram {
          background: #fdf2f8;
          color: #db2777;
        }

        .cp-platform-badge.facebook {
          background: #eff6ff;
          color: #2563eb;
        }

        .cp-platform-badge.linkedin {
          background: #eef2ff;
          color: #1d4ed8;
        }

        .cp-action-buttons {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .cp-action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 12px 18px;
          border: 0;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .cp-action-button:hover {
          transform: translateY(-1px);
        }

        .cp-action-primary {
          background: linear-gradient(
            135deg,
            #2563eb,
            #06b6d4
          );
          color: #ffffff;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.22);
        }

        .cp-action-primary:hover {
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.3);
        }

        .cp-action-secondary {
          border: 1px solid #bfdbfe;
          background: #ffffff;
          color: #2563eb;
        }

        .cp-action-secondary:hover {
          background: #eff6ff;
        }

        .cp-action-draft {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #475569;
        }

        .cp-action-draft:hover {
          background: #f1f5f9;
        }

        .cp-success {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 15px;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 700;
        }

        .cp-success.error {
          border-color: #fecaca;
          background: #fef2f2;
          color: #dc2626;
        }

        .cp-schedule-summary {
          margin-top: 16px;
          padding: 13px 15px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #f8fbff;
        }

        .cp-schedule-summary strong {
          display: block;
          margin-bottom: 4px;
          color: #334155;
          font-size: 13px;
        }

        .cp-schedule-summary span {
          color: #64748b;
          font-size: 12px;
        }

        .cp-footer {
          padding: 15px 18px;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 1100px) {
          .cp-layout {
            grid-template-columns: 1fr;
          }

          .cp-preview {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .cp-page {
            padding: 14px;
          }

          .cp-header {
            padding: 18px;
          }

          .cp-header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .cp-grid-2,
          .cp-grid-3,
          .cp-media-grid,
          .cp-action-buttons {
            grid-template-columns: 1fr;
          }

          .cp-preview-media {
            grid-template-columns: 1fr;
          }

          .cp-card-header {
            padding: 14px 16px;
          }

          .cp-card-body {
            padding: 16px;
          }

          .cp-title {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .cp-header-title {
            font-size: 20px;
          }

          .cp-header-subtitle {
            font-size: 12px;
          }

          .cp-preview-media-item img,
          .cp-preview-media-item video {
            height: 150px;
          }
        }
      `}</style>
      </main>
    </div>
  );
};

=======
      !activeDraftMode &&
      (!scheduleDate || !scheduleTime)
    ) {
      setError('Please set a schedule date and time.');
      return;
    }

    if (uploading) {
      setError('Please wait until media upload finishes.');
      return;
    }

    if (
      media.length > 0 &&
      uploadedMedia.length !== media.length
    ) {
      setError(
        'Media upload is incomplete. Please wait until all media files finish uploading.'
      );
      return;
    }

    let mediaType: PostMediaType = 'text';
    let mediaUrl: string | null = null;

    if (uploadedMedia.length >= 2) {
      mediaType = 'carousel';
    } else if (uploadedMedia.length === 1) {
      mediaType = uploadedMedia[0].media_type as
        | 'image'
        | 'video';
    } else if (
      isEditMode &&
      existingMediaUrl &&
      !existingMediaRemoved
    ) {
      mediaType = existingMediaType || 'text';
    }

    if (mediaType === 'carousel') {
      if (uploadedMedia.length < 2) {
        setError('A carousel must contain at least 2 images.');
        return;
      }

      if (uploadedMedia.length > MAX_CAROUSEL_IMAGES) {
        setError(
          `A carousel can contain a maximum of ${MAX_CAROUSEL_IMAGES} images.`
        );
        return;
      }

      const unsupported = selectedPlatforms.filter(
        (platform) => !isCarouselPlatform(platform)
      );

      if (unsupported.length > 0) {
        setError(
          'Carousel publishing is supported only for Instagram, Facebook, and LinkedIn.'
        );
        return;
      }

      if (media.some((item) => item.type !== 'image')) {
        setError('A carousel can contain images only.');
        return;
      }

      const carouselUrls = uploadedMedia.map(
        (item) => item.media_url
      );

      if (
        carouselUrls.some(
          (url) => !isValidRemoteUrl(url)
        )
      ) {
        setError(
          'One or more carousel media URLs are invalid. Please upload the images again.'
        );
        return;
      }

      mediaUrl = JSON.stringify(carouselUrls);
    } else if (uploadedMedia.length === 1) {
      mediaUrl = uploadedMedia[0].media_url;

      if (!isValidRemoteUrl(mediaUrl)) {
        setError(
          'Cannot save this post because the media URL is invalid.'
        );
        return;
      }
    } else if (
      isEditMode &&
      existingMediaUrl &&
      !existingMediaRemoved
    ) {
      mediaUrl = existingMediaUrl;
    }

    if (mediaUrl?.includes('blob:')) {
      setError(
        'Cannot save this post because a browser blob URL was detected. Please upload the media again.'
      );
      return;
    }

    let scheduledTime: string | null = null;

    if (!activeDraftMode) {
      scheduledTime = `${scheduleDate}T${scheduleTime}:00`;
    }

    const campaignId = selectedCampaignId
      ? Number(selectedCampaignId)
      : null;

    try {
      setPublishing(true);

      const normalizedAccountIds = selectedAccountIds
        .map(Number)
        .filter((id) => !Number.isNaN(id));

      if (isEditMode && editId) {
        const updatePayload: PostUpdatePayload = {
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType,
          scheduled_time: scheduledTime,
          timezone: 'Asia/Kolkata',
          campaign_id: campaignId,
          social_account_ids: normalizedAccountIds,
          save_as_draft: activeDraftMode,
        };

        const response = await postService.update(
          editId,
          updatePayload
        );

        if (
          response.data?.media_url &&
          response.data.media_url.includes('blob:')
        ) {
          throw new Error(
            'Backend stored a blob media URL. This post should not be used for publishing.'
          );
        }

        setSuccess(true);

        setTimeout(() => {
          navigate('/app/posts');
        }, 1200);
      } else {
        const postData = {
          client_id: null,
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType,
          scheduled_time: scheduledTime,
          timezone: 'Asia/Kolkata',
          campaign_id: campaignId,
          social_account_ids: normalizedAccountIds,
          save_as_draft: activeDraftMode,
        };

        const response = await postService.create(postData);

        if (
          response.data?.media_url &&
          response.data.media_url.includes('blob:')
        ) {
          throw new Error(
            'Backend stored a blob media URL. This post should not be used for publishing.'
          );
        }

        setSuccess(true);

        media.forEach((item) => {
          if (item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url);
          }
        });

        setContent('');
        setMedia([]);
        setUploadedMedia([]);
        setScheduleDate('');
        setScheduleTime('');
        setSelectedCampaignId('');
        setIsDraftMode(false);
        setSelectedAccountIds([]);
        setUploadProgress(0);

        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }

        if (videoInputRef.current) {
          videoInputRef.current.value = '';
        }

        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Post submission error:', err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item: any) =>
                item.msg || 'Validation error'
            )
            .join(', ')
        );
      } else {
        setError(
          detail ||
            err.message ||
            'Unable to save the post. Please try again.'
        );
      }
    } finally {
      setPublishing(false);
    }
  };

  const imageCount = media.filter(
    (item) => item.type === 'image'
  ).length;

  const isCarousel = imageCount >= 2;

  const selectedPlatforms = getSelectedPlatforms();

  const hasExistingMedia =
    isEditMode &&
    existingMediaUrl &&
    !existingMediaRemoved &&
    media.length === 0;

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-gray-500">
          Loading post...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {isEditMode ? 'Edit Post' : 'Create Post'}
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          {isEditMode
            ? 'Update your post content, media, or schedule.'
            : 'Compose and schedule content across your connected social platforms'}
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
                  Images: Instagram, Facebook, LinkedIn. Videos:
                  Instagram, Facebook, LinkedIn, YouTube. Carousels:
                  Instagram, Facebook, LinkedIn.
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
                  Connect your social accounts first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.map((account) => {
                  const platform = normalizePlatform(
                    account.platform
                  );

                  const config = getPlatformConfig(platform);
                  const Icon = config?.icon || ImageIcon;

                  const selected =
                    selectedAccountIds.includes(account.id);

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() =>
                        toggleAccount(account.id)
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
                            config?.color || '#6366f1',
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">
                          {getPlatformName(platform)}
                        </p>

                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getAccountDisplayName(account)}
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
              <div className="mt-3 space-y-1">
                <p className="text-xs text-indigo-600">
                  {selectedAccountIds.length} account
                  {selectedAccountIds.length > 1 ? 's' : ''} selected
                </p>

                <p className="text-xs text-gray-500">
                  Platforms:{' '}
                  {selectedPlatforms
                    .map(getPlatformName)
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
              {[Bold, Italic, List, Link2, Smile].map(
                (Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      if (index === 4) {
                        setContent((prev) => prev + '😊');
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
                onClick={() => openImagePicker(false)}
                disabled={
                  uploading ||
                  publishing ||
                  selectedAccountIds.length === 0
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Select one or multiple images"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={openVideoPicker}
                disabled={
                  uploading ||
                  publishing ||
                  selectedAccountIds.length === 0
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Select one video"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setContent((prev) => prev + '#')
                }
                className="p-1.5 rounded-lg hover:bg-white transition-colors text-gray-500 hover:text-gray-700"
              >
                <Hash className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="What's on your mind? Write your post content here..."
              rows={6}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />

            {/*
             * IMPORTANT:
             *
             * DO NOT add an onClick handler that resets this input.
             *
             * `multiple` is what allows multiple files.
             */}
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={async (event) => {
                const input = event.currentTarget;

                /*
                 * Copy ALL File objects first.
                 */
                const files = Array.from(input.files || []);

                /*
                 * Read the replace/append mode before
                 * clearing the input.
                 */
                const replace =
                  imagePickerReplaceRef.current;

                /*
                 * Clear only AFTER copying File objects.
                 */
                input.value = '';

                if (files.length === 0) {
                  return;
                }

                console.log(
                  'IMAGE FILES SELECTED:',
                  files.length,
                  files.map((file) => ({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                  }))
                );

                await handleImageFiles(files, replace);
              }}
            />

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
              className="hidden"
              onChange={async (event) => {
                const input = event.currentTarget;

                const files = Array.from(input.files || []);

                input.value = '';

                if (files.length === 0) {
                  return;
                }

                await handleVideoFile(files);
              }}
            />

            {uploading && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600 animate-pulse" />

                  <div className="flex-1">
                    <p className="text-sm text-indigo-700 font-medium">
                      Uploading media...
                    </p>

                    <p className="text-xs text-indigo-500 mt-0.5">
                      {media.length > 1
                        ? `Uploading carousel images... ${uploadProgress}%`
                        : `Uploading media... ${uploadProgress}%`}
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {uploadedMedia.length > 0 && !uploading && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />

                <div className="min-w-0">
                  <p className="text-sm text-green-700 font-medium">
                    Media uploaded successfully
                  </p>

                  <p className="text-xs text-green-600 mt-0.5">
                    {uploadedMedia.length >= 2
                      ? `Carousel • ${uploadedMedia.length} images`
                      : uploadedMedia[0]?.media_type}
                  </p>
                </div>
              </div>
            )}

            {hasExistingMedia && (
              <div className="mt-3 rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Current media
                  </p>

                  <button
                    type="button"
                    onClick={removeExistingMedia}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                {existingMediaType === 'video' ? (
                  <video
                    src={existingMediaUrl || undefined}
                    controls
                    className="w-full max-w-sm rounded-lg"
                  />
                ) : existingMediaType === 'carousel' ? (
                  <p className="text-xs text-gray-500">
                    This post has a carousel attached. Upload new
                    images to replace it.
                  </p>
                ) : (
                  <img
                    src={existingMediaUrl || undefined}
                    alt="Current post media"
                    className="w-full max-w-sm rounded-lg object-cover"
                  />
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Uploading new media will replace this.
                </p>
              </div>
            )}

            {media.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {isCarousel
                        ? `Carousel • ${media.length}/${MAX_CAROUSEL_IMAGES} images`
                        : media[0]?.type === 'video'
                        ? 'Selected video'
                        : 'Selected image'}
                    </p>

                    <p className="text-xs text-gray-400">
                      {isCarousel
                        ? 'All selected images will be published as one carousel.'
                        : 'Your selected media.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeAllMedia}
                    disabled={uploading || publishing}
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
                  {media.map((item, index) => (
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
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}

                      {isCarousel && (
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/75 text-white text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        disabled={
                          uploading || publishing
                        }
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
                        <div className="px-2 py-1 rounded-md bg-black/60 text-white text-[10px] truncate max-w-[70%]">
                          {item.name}
                        </div>

                        <div className="px-2 py-1 rounded-md bg-black/60 text-white text-[10px]">
                          {uploadedMedia[index]
                            ? 'Uploaded'
                            : uploading
                            ? 'Uploading'
                            : 'Pending'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {media.every(
                  (item) => item.type === 'image'
                ) &&
                  media.length < MAX_CAROUSEL_IMAGES && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openImagePicker(false)
                        }
                        disabled={
                          uploading || publishing
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        Add More Images
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openImagePicker(true)
                        }
                        disabled={
                          uploading || publishing
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 disabled:opacity-50"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Replace Images
                      </button>
                    </div>
                  )}
              </div>
            )}

            {media.length === 0 &&
              !hasExistingMedia && (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() =>
                    setIsDragging(false)
                  }
                  onDrop={async (event) => {
                    event.preventDefault();
                    setIsDragging(false);

                    const files = Array.from(
                      event.dataTransfer.files
                    );

                    await handleFileDrop(files);
                  }}
                  className={cn(
                    'mt-3 border-2 border-dashed rounded-xl p-6 text-center transition-all',
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    uploading &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />

                  <p className="text-sm text-gray-600 font-medium">
                    Drag & drop media
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    You can drop multiple images at once to
                    create a carousel.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        openImagePicker(true)
                      }
                      disabled={
                        uploading ||
                        publishing ||
                        selectedAccountIds.length === 0
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 disabled:opacity-50"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Select Images
                    </button>

                    <button
                      type="button"
                      onClick={openVideoPicker}
                      disabled={
                        uploading ||
                        publishing ||
                        selectedAccountIds.length === 0
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Video className="w-4 h-4" />
                      Select Video
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    <strong>Carousel:</strong> Select 2–10 images
                    at once, or use "Add More Images".
                    <br />
                    JPEG, PNG, WebP, GIF up to 50 MB each.
                    <br />
                    MP4, MOV, AVI, WebM videos up to 50 MB.
                  </p>
                </div>
              )}

            {media.length > 0 &&
              media.some(
                (item) => item.type === 'video'
              ) && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={openVideoPicker}
                    disabled={
                      uploading || publishing
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Video className="w-4 h-4" />
                    Replace Video
                  </button>
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
                      isDraftMode || publishing
                    }
                    value={scheduleDate}
                    onChange={(event) =>
                      setScheduleDate(
                        event.target.value
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
                      isDraftMode || publishing
                    }
                    value={scheduleTime}
                    onChange={(event) =>
                      setScheduleTime(
                        event.target.value
                      )
                    }
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Campaign (optional)
                </label>

                <button
                  type="button"
                  onClick={loadCampaigns}
                  disabled={
                    loadingCampaigns ||
                    publishing
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>

              {loadingCampaigns ? (
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-500">
                  Loading campaigns...
                </div>
              ) : (
                <select
                  value={selectedCampaignId}
                  onChange={(event) =>
                    setSelectedCampaignId(
                      event.target.value
                    )
                  }
                  disabled={publishing}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    No campaign
                  </option>

                  {campaigns.map((campaign) => (
                    <option
                      key={campaign.id}
                      value={campaign.id}
                    >
                      {getCampaignDisplayName(
                        campaign
                      )}
                    </option>
                  ))}
                </select>
              )}

              {!loadingCampaigns &&
                campaigns.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    No campaigns are available.
                    Create a campaign first, then
                    refresh this field.
                  </p>
                )}
            </div>

            <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
              <button
                type="button"
                onClick={() =>
                  setIsDraftMode(!isDraftMode)
                }
                disabled={publishing}
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
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />

                <span>{error}</span>
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

                {isEditMode
                  ? 'Post updated successfully!'
                  : 'Post created successfully in the backend!'}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              icon={<X className="w-4 h-4" />}
              onClick={handleCancelForm}
              disabled={
                publishing || uploading
              }
            >
              Cancel
            </Button>

            <Button
              variant="secondary"
              fullWidth
              icon={<Save className="w-4 h-4" />}
              onClick={() =>
                handlePostSubmission(true)
              }
              loading={
                publishing && isDraftMode
              }
              disabled={
                publishing ||
                uploading ||
                loadingAccounts
              }
            >
              {isEditMode
                ? 'Update Draft'
                : 'Save Draft'}
            </Button>

            <Button
              variant="primary"
              fullWidth
              icon={<Send className="w-4 h-4" />}
              onClick={() =>
                handlePostSubmission(false)
              }
              loading={
                publishing && !isDraftMode
              }
              disabled={
                publishing ||
                uploading ||
                loadingAccounts
              }
            >
              {isEditMode
                ? 'Update Schedule'
                : 'Schedule Post'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6">
            <ContentPreview
              content={content}
              mediaUrl={
                media.length > 0
                  ? media[0].url
                  : hasExistingMedia
                  ? existingMediaUrl
                  : null
              }
              mediaType={
                media.length > 0
                  ? media[0].type
                  : hasExistingMedia &&
                    existingMediaType === 'video'
                  ? 'video'
                  : hasExistingMedia
                  ? 'image'
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
>>>>>>> origin/shravanik-latest-scheduler
