import React from "react";

type ContentItem = {
  id: number;
  title: string;
  content: string;
};

const ContentLibraryPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [searchText, setSearchText] = React.useState("");

  const [savedContent, setSavedContent] = React.useState<ContentItem[]>([]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter both content title and content.");
      return;
    }

    const newContent: ContentItem = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
    };

    setSavedContent((prev) => [newContent, ...prev]);

    setTitle("");
    setContent("");
    setShowAddForm(false);
  };

  const filteredContent = savedContent.filter((item) => {
    const search = searchText.toLowerCase();

    return (
      item.title.toLowerCase().includes(search) ||
      item.content.toLowerCase().includes(search)
    );
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "24px",
            border: "1px solid #e5eaf2",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#172554",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            Content Library
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Manage your saved posts, media and content ideas.
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setShowSearch(false);
            }}
            style={{
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add Content
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSearch((prev) => !prev);
              setShowAddForm(false);
            }}
            style={{
              background: "#ffffff",
              color: "#334155",
              border: "1px solid #dbe3ef",
              borderRadius: "10px",
              padding: "12px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>

          {showSearch && (
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search content..."
              autoFocus
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                minWidth: "260px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          )}
        </div>

        {/* Add Content Form */}
        {showAddForm && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5eaf2",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <h2
              style={{
                margin: "0 0 18px",
                color: "#172554",
              }}
            >
              Add Content
            </h2>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Content title"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                marginBottom: "12px",
                fontSize: "15px",
              }}
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content..."
              rows={6}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                marginBottom: "16px",
                fontSize: "15px",
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={handleSave}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setTitle("");
                  setContent("");
                }}
                style={{
                  background: "#ffffff",
                  color: "#334155",
                  border: "1px solid #dbe3ef",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Saved Content */}
        {filteredContent.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredContent.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid #e5eaf2",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px",
                    color: "#172554",
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#475569",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              minHeight: "360px",
              border: "1px solid #e5eaf2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "12px",
                }}
              >
                📚
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#1e293b",
                }}
              >
                {searchText ? "No matching content" : "No content yet"}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                }}
              >
                {searchText
                  ? "Try a different search."
                  : "Your saved posts and media will appear here."}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ContentLibraryPage;