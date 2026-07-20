import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteHistoryItem, deleteAllHistory } from '../services/api';
import diseaseData from '../data/diseaseData';
import BackButton from './BackButton';

const History = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const getConfidenceRatio = (confidence) => {
    const numericConfidence = Number(confidence) || 0;
    return numericConfidence > 1 ? numericConfidence / 100 : numericConfidence;
  };

  const getDiseaseTitle = (diseaseName) => {
    const diseaseKey = String(diseaseName || '').toLowerCase();
    return diseaseData[diseaseKey]?.title || diseaseName;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    (async () => {
      try {
        const data = await getHistory();
        setItems(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div className="p-8">Loading history...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const handleDeleteItem = async (historyId) => {
    setActionError('');
    setDeletingId(historyId);

    try {
      await deleteHistoryItem(historyId);
      setItems((currentItems) => currentItems.filter((item) => (item._id || item.id) !== historyId));
    } catch (deleteError) {
      setActionError(deleteError.message || 'Failed to delete history item');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!items.length) {
      return;
    }

    setActionError('');
    setDeletingAll(true);

    try {
      await deleteAllHistory();
      setItems([]);
    } catch (deleteError) {
      setActionError(deleteError.message || 'Failed to delete history');
    } finally {
      setDeletingAll(false);
    }
  };

  if (!items.length) {
    return <div className="p-8">No history items found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-4">
          <BackButton label="Back" fallbackPath="/dashboard" />
          <h2 className="text-2xl font-bold">Your Analysis History</h2>
        </div>
        <button
          onClick={handleDeleteAll}
          disabled={deletingAll || !items.length}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deletingAll ? 'Deleting...' : 'Delete All History'}
        </button>
      </div>
      {actionError && <div className="mb-4 text-sm text-red-600">{actionError}</div>}
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item._id || item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
            <div className="w-32 h-32 bg-gray-100 rounded overflow-hidden shrink-0">
              {item.imageUrl ? (
                <img src={`http://localhost:3001${item.imageUrl}`} alt={item.diseaseName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{getDiseaseTitle(item.diseaseName)}</h3>
                  <p className="text-sm text-gray-600">Confidence: {(getConfidenceRatio(item.confidence) * 100).toFixed(2)}%</p>
                </div>
                <div className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</div>
              </div>
              {item.details && <p className="mt-2 text-sm text-gray-700">{item.details}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    // Build a result object compatible with Results page
                    const result = {
                      prediction: { disease: item.diseaseName, confidence: getConfidenceRatio(item.confidence) },
                      probabilities: item.probabilities || [],
                      details: item.details || '',
                      recommendations: item.recommendations || '',
                      imageUrl: item.imageUrl || null,
                    };
                    localStorage.setItem('analysisResult', JSON.stringify(result));
                    navigate('/results');
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  View
                </button>
                <button
                  onClick={() => {
                    // download image or open in new tab
                    if (item.imageUrl) window.open(`http://localhost:3001${item.imageUrl}`, '_blank');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Open Image
                </button>
                <button
                  onClick={() => handleDeleteItem(item._id || item.id)}
                  disabled={deletingId === (item._id || item.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === (item._id || item.id) ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
