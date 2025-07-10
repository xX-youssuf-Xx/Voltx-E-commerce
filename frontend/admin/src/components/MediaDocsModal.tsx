import React, { useState, useEffect } from 'react';

interface MediaItem {
  media_id: number;
  image_url: string;
  alt_text?: string;
  sort_order?: number;
}

interface DocItem {
  document_id: number;
  file_name: string;
  file_url: string;
  file_size_kb?: number;
  type?: string;
  description?: string;
}

interface MediaDocsModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
}

export const MediaDocsModal: React.FC<MediaDocsModalProps> = ({ open, onClose, productId }) => {
  const [tab, setTab] = useState<'media' | 'docs'>('media');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const MEDIA_BASE = import.meta.env.VITE_API_MEDIA_URL;

  useEffect(() => {
    if (open) {
      fetchMedia();
      fetchDocs();
    }
    // eslint-disable-next-line
  }, [open, productId]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/docs`);
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async () => {
    if (!mediaFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', mediaFile);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}/media`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        fetchMedia();
        setMediaFile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}/media/${mediaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchMedia();
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoc = async () => {
    if (!docFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', docFile);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}/docs`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        fetchDocs();
        setDocFile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}/docs/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchDocs();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button className={`px-4 py-2 rounded ${tab === 'media' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setTab('media')}>Media</button>
            <button className={`px-4 py-2 rounded ${tab === 'docs' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setTab('docs')}>Docs</button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        {tab === 'media' && (
          <div>
            <div className="mb-4">
              <input type="file" accept="image/*,video/*" onChange={e => setMediaFile(e.target.files?.[0] || null)} />
              <button onClick={handleAddMedia} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded" disabled={loading || !mediaFile}>Add Media</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {media.map(item => (
                <div key={item.media_id} className="border rounded p-2 flex flex-col items-center">
                  {item.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={`${MEDIA_BASE}${item.image_url}`} controls className="w-full h-32 object-contain" />
                  ) : (
                    <img src={`${MEDIA_BASE}${item.image_url}`} alt={item.alt_text || ''} className="w-full h-32 object-contain" />
                  )}
                  <button onClick={() => handleDeleteMedia(item.media_id)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs" disabled={loading}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'docs' && (
          <div>
            <div className="mb-4">
              <input type="file" onChange={e => setDocFile(e.target.files?.[0] || null)} />
              <button onClick={handleAddDoc} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded" disabled={loading || !docFile}>Add Doc</button>
            </div>
            <div>
              {docs.map(doc => (
                <div key={doc.document_id} className="border rounded p-2 flex items-center justify-between mb-2">
                  <a href={`${MEDIA_BASE}${doc.file_url}`} target="_blank" rel="noopener noreferrer" className="truncate max-w-xs">{doc.file_name}</a>
                  <button onClick={() => handleDeleteDoc(doc.document_id)} className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs" disabled={loading}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 