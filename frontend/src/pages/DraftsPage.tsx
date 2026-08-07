import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2 } from 'lucide-react';
import { Card, Badge, Button, EmptyState } from '../components/ui';
import { postService } from '../services/api';
import { formatDate } from '../utils/helpers';

interface DraftPost {
  id: number | string;
  content?: string;
  status: string;
  created_at: string;
  media_url?: string | null;
  media_type?: string;
}

export function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<number | string | null>(null);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = (await postService.getAll?.()) || { data: [] };
      const allPosts = response.data || [];
      const userDrafts = allPosts.filter((p: DraftPost) => p.status === 'draft');
      setDrafts(userDrafts);
    } catch (error) {
      console.error('Failed to load drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      setActionId(id);
      await postService.delete(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Failed to delete draft:', error);
      alert('Failed to delete draft.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Draft Management</h1>
        <p className="text-gray-500 mt-1">Review, edit, or schedule your unfinished content drafts.</p>
      </div>

      {loading ? (
        <Card>
          <div className="py-12 text-center text-gray-500">Loading drafts...</div>
        </Card>
      ) : drafts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            title="No drafts found"
            description="When you save posts as drafts, they will appear here for later editing."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {drafts.map((draft) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
              >
                <Card className="h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="warning">Draft</Badge>
                      <span className="text-xs text-gray-400">
                        Created: {formatDate(draft.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm line-clamp-3 mb-4">
                      {draft.content || '[No text content provided]'}
                    </p>
                    {draft.media_url && (
                      <div className="text-xs text-indigo-600 font-medium mb-4 flex items-center gap-1">
                        📎 Attached Media ({draft.media_type})
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase font-semibold">
                      Type: {draft.media_type}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
                        onClick={() => handleDelete(draft.id)}
                        disabled={actionId === draft.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default DraftsPage;