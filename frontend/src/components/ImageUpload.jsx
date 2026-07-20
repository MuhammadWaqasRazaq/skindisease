import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import BackButton from './BackButton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ImageUpload = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', image);
      formData.append('userId', userId);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Analysis failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Store result and navigate to results page
      localStorage.setItem('analysisResult', JSON.stringify(result));
      navigate('/results');
    } catch (err) {
      setError(err.message || `Failed to analyze image. Check that the backend is running at ${API_BASE_URL}.`);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <BackButton label="Back" fallbackPath="/dashboard" />
          <h1 className="text-2xl font-bold text-gray-900">Skin Disease Analysis</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Skin Image</h2>
          <p className="text-gray-600 mb-8">
            Upload a clear, well-lit image of the affected skin area. Our AI model will analyze it and provide insights.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-teal-300 rounded-lg p-12 text-center hover:border-teal-500 transition cursor-pointer"
              onClick={() => document.getElementById('imageInput').click()}>
              {preview ? (
                <div className="space-y-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-80 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-600">
                    {image?.name}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('imageInput').click();
                    }}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-teal-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-600">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3">For Best Results:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ Use a clear, well-lit photo</li>
                <li>✓ Show the entire affected area</li>
                <li>✓ Keep the image in focus</li>
                <li>✓ Avoid shadows or glare</li>
                <li>✓ Use JPEG or PNG format</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!image || loading}
              className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing Image...' : 'Analyze Image'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ImageUpload;
