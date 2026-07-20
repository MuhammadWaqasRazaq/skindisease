import React from 'react';
import { useParams, Link } from 'react-router-dom';
import diseaseData from '../data/diseaseData';
import BackButton from './BackButton';

const Badge = ({ children }) => (
  <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">{children}</span>
);

const DiseaseInfo = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || '');
  const data = diseaseData[decodedName] || null;

  if (!data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-6 flex justify-start">
            <BackButton label="Back" fallbackPath="/home" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Information Not Found</h2>
          <p className="text-gray-600 mb-6">We don't have structured content for "{decodedName}" yet. Try a different condition or return to the results page.</p>
          <div className="flex justify-center gap-4">
            <Link to="/results" className="px-4 py-2 bg-teal-600 text-white rounded-lg">Back to Results</Link>
            <Link to="/" className="px-4 py-2 border rounded-lg">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-teal-50 py-12">
      <div className="max-w-5xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-3 px-4">
        <div className="md:col-span-3 mb-2 flex justify-start">
          <BackButton label="Back" fallbackPath="/home" />
        </div>
        {/* Left image */}
        <div className="md:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <img src={data.image} alt={data.title} className="w-full h-64 object-cover" />
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h1>
            <p className="text-gray-600">{data.short}</p>
            <div className="mt-4 space-x-2">
              <Badge>Symptoms</Badge>
              <Badge>Cautions</Badge>
              <Badge>Treatments</Badge>
            </div>
          </div>
        </div>

        {/* Right details */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold">Overview & Quick Facts</h2>
            <div className="text-sm text-gray-500">Last updated: Today</div>
          </div>

          <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Symptoms</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                {data.symptoms.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Causes</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                {data.causes.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Cautions</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                {data.cautions.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="font-medium mb-3">Recommended Treatments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.treatments.map((t, i) => (
                <div key={i} className="p-4 bg-teal-50 rounded-lg">
                  <p className="text-sm text-teal-800">{t}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="font-medium mb-3">FAQ & Advice</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Q:</strong> When should I see a doctor?</p>
              <p><strong>A:</strong> Seek medical attention if symptoms are severe, rapidly worsening, or if you notice signs of infection or scarring.</p>

              <p><strong>Q:</strong> Can lifestyle help?</p>
              <p><strong>A:</strong> Yes — moisturizing, sun protection, gentle skincare and avoiding known triggers often help.</p>
            </div>
          </section>

          <div className="mt-8 flex gap-4">
            <Link to="/results" className="px-4 py-2 bg-gray-100 rounded-lg">Back to Results</Link>
            <a href="#" onClick={(e)=>e.preventDefault()} className="px-4 py-2 bg-teal-600 text-white rounded-lg">Find Specialists</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseInfo;
