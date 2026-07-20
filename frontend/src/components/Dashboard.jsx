import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Upload, History, User } from 'lucide-react';
import diseaseData from '../data/diseaseData';
import { Activity } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('fullName');
    const id = localStorage.getItem('userId');

    if (!token) {
      navigate('/login');
      return;
    }

    setFullName(name || 'User');
    setUserId(id);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('fullName');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-100 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">              <Activity className="h-8 w-8" /></span>

            </div>
            <h1 className="text-2xl font-bold text-gray-900">DermaDetect</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 ">
              <Link to={'/home'} className="text-gray-700 font-medium hidden   md:block">Disease</Link>

            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">{fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome, {fullName}!</h2>
          <p className="text-xl text-gray-600">
            Use AI-powered skin disease detection to analyze and get insights about skin conditions.
          </p>
        </div>

        <div class="relative mb-10">
  <img 
    src="\images\bg-img-banner-CCfgu6Jl.webp" 
    alt="img" 
    class="w-full h-auto rounded-lg"
  />

  <div className="absolute inset-0 flex items-center justify-start ">
    <h1 className="text-3xl font-bold text-teal-700 px-9 py-1 rounded">
     Early Detection Saves Lives!
    </h1>
  
  </div>
</div>



        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upload Image</h3>
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-gray-600 mb-6">
              Upload a clear image of the affected skin area for AI analysis. Our model will detect and classify potential skin conditions.
            </p>
            <button 
              onClick={() => navigate('/upload')}
              className="w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
            >
              Start Analysis
            </button>
          </div>

          {/* History Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Analysis History</h3>
              <History className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-gray-600 mb-6">
              View all your previous skin analysis results and track changes over time. Keep a record of your skin health journey.
            </p>
            <button 
              onClick={() => navigate('/history')}
              className="w-full py-3 px-4 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition font-medium"
            >
              View History
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-teal-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Upload Image</h4>
              <p className="text-gray-600 text-sm">
                Take or upload a clear photo of the affected skin area in good lighting.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-teal-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-gray-600 text-sm">
                Our advanced ML model analyzes the image and identifies potential skin conditions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-teal-800 font-bold text-lg">3</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Get Results</h4>
              <p className="text-gray-600 text-sm">
                Receive detailed analysis results and recommendations for next steps.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Conditions */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Featured Conditions</h3>
          <p className="text-gray-600 mb-6">Quick overview of common skin conditions — symptoms, cautions and typical treatments.</p>

          <div className="flex flex-col gap-6">
            {Object.entries(diseaseData).map(([key, info]) => (
              <article key={key} className="flex flex-col md:flex-row bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full md:w-56 h-56 md:h-auto shrink-0">
                  <img src={info.image} alt={info.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-2xl md:text-3xl font-semibold text-gray-900">{info.title}</h4>
                      <p className="text-lg md:text-xl text-gray-700 mt-2">{info.short}</p>
                    </div>
                    <div className="text-sm md:text-base text-gray-500">{info.causes?.slice(0,1)}</div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                    <div>
                      <h5 className="font-semibold text-gray-800">Symptoms</h5>
                      <ul className="text-gray-700 list-disc ml-5 mt-2">
                        {info.symptoms?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Cautions</h5>
                      <ul className="text-gray-700 list-disc ml-5 mt-2">
                        {info.cautions?.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">Treatments</h5>
                      <ul className="text-gray-700 list-disc ml-5 mt-2">
                        {info.treatments?.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Link
                      to={`/disease/${encodeURIComponent(key)}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm md:text-base hover:bg-indigo-700"
                    >
                      Read Full Guide
                    </Link>
                    <button
                      onClick={() => navigate('/upload')}
                      className="px-4 py-2 bg-teal-100 text-teal-700 rounded-md text-sm md:text-base hover:bg-teal-200"
                    >
                      Analyze Similar Image
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className="mt-16 rounded-2xl border border-teal-500 bg-teal-600 p-8 shadow-lg shadow-teal-200/40 md:p-10">
          <div className="grid gap-8 md:grid-cols-3 md:items-start">
            <div className="md:col-span-1">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">Project Footer</p>
              <h3 className="mt-3 text-3xl font-bold text-white">DermaDetect</h3>
              <p className="mt-4 max-w-md text-base leading-7 text-teal-50">
                AI-powered skin disease analysis and reference guides designed to support faster screening, better awareness, and clearer next steps.
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-white">What it does</p>
              <ul className="mt-4 space-y-3 text-base text-teal-50">
                <li>• Upload skin images for instant AI analysis</li>
                <li>• Review prediction results and confidence scores</li>
                <li>• Save and manage analysis history</li>
              </ul>
            </div>

            <div className="md:text-right">
              <p className="text-lg font-semibold text-white">Project Note</p>
              <p className="mt-4 text-base leading-7 text-teal-50">
                Built for early skin condition awareness and tracking.
              </p>
              <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-teal-100">© 2026 DermaDetect</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
