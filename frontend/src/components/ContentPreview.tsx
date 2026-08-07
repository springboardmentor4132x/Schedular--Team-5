import { Globe } from 'lucide-react';
import { Card } from './ui';

interface ContentPreviewProps {
  content?: string;
  mediaUrl?: string | null;
  mediaType?: string;
  platform?: string;
}

export function ContentPreview({
  content,
  mediaUrl,
  mediaType,
  platform = 'facebook',
}: ContentPreviewProps) {
  let parsedMediaUrls: string[] = [];
  try {
    if (mediaUrl && typeof mediaUrl === 'string' && mediaUrl.startsWith('[')) {
      parsedMediaUrls = JSON.parse(mediaUrl);
    }
  } catch (e) {
    parsedMediaUrls = [];
  }

  return (
    <Card className="border border-indigo-100 bg-gray-50/50">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
          <Globe className="w-4 h-4 text-indigo-600" />
          Live Platform Preview ({platform.toUpperCase()})
        </div>
        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
          Live Data
        </span>
      </div>

      {/* Simulated Social Media Card Frame */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-md mx-auto">
        {/* Author Header */}
        <div className="p-3 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
            SP
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">SocialPilot Workspace</p>
            <p className="text-[10px] text-gray-400">Just now • 🌍</p>
          </div>
        </div>

        {/* Post Text Body */}
        <div className="p-3 text-sm text-gray-800 whitespace-pre-wrap">
          {content || 'Your post caption and hashtags will appear here...'}
        </div>

        {/* Media Preview Box */}
        {parsedMediaUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 bg-gray-100 border-t border-b border-gray-100 max-h-60 overflow-y-auto">
            {parsedMediaUrls.map((url, idx) => (
              <img key={idx} src={url} alt={`Carousel item ${idx + 1}`} className="w-full h-32 object-cover" />
            ))}
          </div>
        ) : mediaUrl ? (
          <div className="bg-gray-100 max-h-60 overflow-hidden flex items-center justify-center border-t border-b border-gray-100">
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls className="w-full h-auto max-h-60 object-cover" />
            ) : (
              <img src={mediaUrl} alt="Upload preview" className="w-full h-auto max-h-60 object-cover" />
            )}
          </div>
        ) : null}

        {/* Engagement Action Bar */}
        <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span>👍 Like</span>
          <span>💬 Comment</span>
          <span>↗️ Share</span>
        </div>
      </div>
    </Card>
  );
}

export default ContentPreview;