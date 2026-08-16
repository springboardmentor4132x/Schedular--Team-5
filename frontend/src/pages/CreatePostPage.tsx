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
      );
      return;
    }

    if (
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

