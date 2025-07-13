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
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
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
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      } else {
        console.error('Failed to fetch media:', res.status);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}/docs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      } else {
        console.error('Failed to fetch docs:', res.status);
      }
    } catch (error) {
      console.error('Error fetching docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedia = async () => {
    if (mediaFiles.length === 0) return;
    setLoading(true);
    try {
      for (const file of mediaFiles) {
      const formData = new FormData();
        formData.append('image', file);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}/media`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
        if (!res.ok) {
          const error = await res.json();
          console.error('Failed to add media:', error);
        }
      }
      await fetchMedia();
      setMediaFiles([]);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error adding media:', error);
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
      if (res.ok) {
        await fetchMedia();
      } else {
        const error = await res.json();
        console.error('Failed to delete media:', error);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoc = async () => {
    if (docFiles.length === 0) return;
    setLoading(true);
    try {
      for (const file of docFiles) {
      const formData = new FormData();
        formData.append('file', file);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/products/${productId}/docs`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
        if (!res.ok) {
          const error = await res.json();
          console.error('Failed to add document:', error);
        }
      }
      await fetchDocs();
      setDocFiles([]);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]:not([accept*="image"])') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error adding document:', error);
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
      if (res.ok) {
        await fetchDocs();
      } else {
        const error = await res.json();
        console.error('Failed to delete document:', error);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Product Media & Documents</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              tab === 'media' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`} 
            onClick={() => setTab('media')}
          >
            Media Files
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              tab === 'docs' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`} 
            onClick={() => setTab('docs')}
          >
            Documents
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
        {tab === 'media' && (
          <div>
              {/* Upload Section */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Add Media File</h3>
                <div className="flex items-center space-x-4">
                  <input 
                    type="file" 
                    accept="image/*,video/*" 
                    multiple
                    onChange={e => setMediaFiles(Array.from(e.target.files || []))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button 
                    onClick={handleAddMedia} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
                    disabled={loading || mediaFiles.length === 0}
                  >
                    {loading ? 'Uploading...' : `Upload ${mediaFiles.length} Media File${mediaFiles.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>

              {/* Media Grid */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading media...</p>
            </div>
              ) : media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map(item => (
                    <div key={item.media_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {item.image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video 
                            src={`${MEDIA_BASE}${item.image_url}`} 
                            controls 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <img 
                            src={`${MEDIA_BASE}${item.image_url}`} 
                            alt={item.alt_text || ''} 
                            className="w-full h-full object-cover" 
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <button 
                          onClick={() => handleDeleteMedia(item.media_id)} 
                          className="w-full px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors" 
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                </div>
              ))}
            </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No media files uploaded yet.</p>
          </div>
        )}
            </div>
          )}

          {tab === 'docs' && (
            <div>
              {/* Upload Section */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Add Document</h3>
                <div className="flex items-center space-x-4">
                  <input 
                    type="file" 
                    multiple
                    onChange={e => setDocFiles(Array.from(e.target.files || []))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button 
                    onClick={handleAddDoc} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" 
                    disabled={loading || docFiles.length === 0}
                  >
                    {loading ? 'Uploading...' : `Upload ${docFiles.length} Document${docFiles.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>

              {/* Documents List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading documents...</p>
                </div>
              ) : docs.length > 0 ? (
                <div className="space-y-3">
              {docs.map(doc => (
                    <div key={doc.document_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-lg">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate" title={doc.file_name}>
                            {doc.file_name}
                          </p>
                          {doc.file_size_kb && (
                            <p className="text-sm text-gray-500">{(doc.file_size_kb / 1024).toFixed(1)} MB</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <a 
                          href={`${MEDIA_BASE}${doc.file_url}`} 
                          download
                          className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                        >
                          Download
                        </a>
                        <button 
                          onClick={() => handleDeleteDoc(doc.document_id)} 
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors" 
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                </div>
              ))}
            </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No documents uploaded yet.</p>
          </div>
        )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 