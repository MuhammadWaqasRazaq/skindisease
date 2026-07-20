import { Link } from 'react-router-dom';
import diseaseData from '../data/diseaseData';
import BackButton from './BackButton';

export default function Home() {
  const entries = Object.entries(diseaseData);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton label="Back" fallbackPath="/dashboard" />
        </div>
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Skin Conditions & Guides</h1>
          <p className="mt-2 text-gray-600">Learn about common skin conditions, symptoms, precautions and treatments.</p>
        </header>

        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([key, info]) => (
            <article key={key} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="h-44 bg-gray-200 overflow-hidden">
                <img
                  src={info.image}
                  alt={info.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{info.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{info.short}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={`/disease/${encodeURIComponent(key)}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Learn More
                  </Link>
                  <span className="text-xs text-gray-500">{info.causes?.slice(0,1)}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
