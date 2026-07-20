import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import diseaseData from '../data/diseaseData';
import BackButton from './BackButton';
import { buildBackendAssetUrl } from '../config/api';

const Results = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const getConfidenceRatio = (confidence) => {
    const numericConfidence = Number(confidence) || 0;
    return numericConfidence > 1 ? numericConfidence / 100 : numericConfidence;
  };

  const getDiseaseName = () => {
    const diseaseKey = String(result?.prediction?.disease || result?.raw?.disease || result?.disease || '').toLowerCase();
    return diseaseData[diseaseKey]?.title || result?.prediction?.disease || result?.raw?.disease || result?.disease || 'Unknown';
  };

  const getDiseaseKey = () => String(result?.prediction?.disease || result?.raw?.disease || result?.disease || '').toLowerCase();

  const diseaseInfo = diseaseData[getDiseaseKey()] || null;
  const otherDiseaseProbabilities = (result?.probabilities || [])
    .filter((entry) => String(entry?.disease || '').toLowerCase() !== getDiseaseKey())
    .sort((left, right) => (right.probability || 0) - (left.probability || 0));

  const getDiseaseTitleByKey = (diseaseKey) => diseaseData[String(diseaseKey || '').toLowerCase()]?.title || diseaseKey;

  useEffect(() => {
    // Get result from localStorage
    const storedResult = localStorage.getItem('analysisResult');
    
    if (!storedResult) {
      navigate('/upload');
      return;
    }

    const parsedResult = JSON.parse(storedResult);
    setResult(parsedResult);
    setLoading(false);
  }, [navigate]);

  const handleDownloadReport = () => {
    if (!result) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SKIN DISEASE ANALYSIS REPORT', pageWidth / 2, 16, { align: 'center' });

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' });

    const predictionRows = [
      ['Detected Disease', getDiseaseName()],
      ['Confidence Score', `${(getConfidenceRatio(result.prediction?.confidence) * 100).toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: 48,
      head: [['Prediction Summary', 'Value']],
      body: predictionRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 11,
        textColor: [55, 65, 81],
        lineColor: [203, 213, 225],
        cellPadding: 4,
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [15, 118, 110],
        textColor: 255,
        halign: 'center',
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 70, halign: 'center' },
        1: { cellWidth: 100, halign: 'center' },
      },
      margin: { left: (pageWidth - 170) / 2, right: (pageWidth - 170) / 2 },
    });

    const otherRows = otherDiseaseProbabilities.slice(0, 6).map((entry) => [
      getDiseaseTitleByKey(entry.disease),
      `${((entry.probability || 0) * 100).toFixed(2)}%`,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [['Other Diseases', 'Confidence']],
      body: otherRows.length > 0 ? otherRows : [['No additional scores available', '-']],
      theme: 'striped',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        textColor: [55, 65, 81],
        cellPadding: 4,
        halign: 'center',
      },
      headStyles: {
        fillColor: [45, 212, 191],
        textColor: 15,
        halign: 'center',
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 253, 250],
      },
      columnStyles: {
        0: { cellWidth: 110, halign: 'center' },
        1: { cellWidth: 60, halign: 'center' },
      },
      margin: { left: (pageWidth - 170) / 2, right: (pageWidth - 170) / 2 },
    });

    const detailsStartY = doc.lastAutoTable.finalY + 14;
    if (result.details) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(17, 24, 39);
      doc.text('Details', 20, detailsStartY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.splitTextToSize(result.details, pageWidth - 40).forEach((line, index) => {
        doc.text(line, 20, detailsStartY + 8 + (index * 6));
      });
    }

    const recommendationsStartY = result.details
      ? detailsStartY + doc.splitTextToSize(result.details, pageWidth - 40).length * 6 + 14
      : detailsStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text('Recommendations', 20, recommendationsStartY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    const recommendationsText = result.recommendations || 'Consult with a dermatologist. Follow prescribed treatment. Monitor the affected area.';
    doc.splitTextToSize(recommendationsText, pageWidth - 40).forEach((line, index) => {
      doc.text(line, 20, recommendationsStartY + 8 + (index * 6));
    });

    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('This report is generated by AI and should not replace professional medical advice.', pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`skin_analysis_${new Date().getTime()}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No results found</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Upload Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton label="Back" fallbackPath="/dashboard" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Primary Prediction */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Primary Prediction</h2>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-linear-to-br from-teal-50 to-blue-50 rounded-lg p-6 h-full">
              <p className="text-gray-600 text-sm font-medium mb-2">Detected Condition</p>
              <h3 className="text-3xl font-bold text-teal-600 mb-4 leading-tight">
                {getDiseaseName()}
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">Confidence Score</span>
                    <span className="text-lg font-bold text-teal-600">
                      {(getConfidenceRatio(result.prediction?.confidence) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-teal-600 h-3 rounded-full transition-all"
                      style={{ width: `${getConfidenceRatio(result.prediction?.confidence) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-teal-100 bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-sm font-semibold text-gray-700">Other Disease Confidence Scores</p>
                  <p className="text-xs text-gray-500">Top 6</p>
                </div>

                {otherDiseaseProbabilities.length > 0 ? (
                  <div className="space-y-3">
                    {otherDiseaseProbabilities.map((entry, index) => (
                      <div key={`${entry.disease}-${index}`}>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-sm font-medium text-gray-700">{getDiseaseTitleByKey(entry.disease)}</span>
                          <span className="text-sm font-semibold text-teal-600">{((entry.probability || 0) * 100).toFixed(2)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-teal-500 transition-all"
                            style={{ width: `${(entry.probability || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Confidence scores will appear here after the model returns full probabilities.</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 h-full">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Uploaded Image</p>
                <div className="w-full overflow-hidden rounded-lg bg-gray-100">
                  {result?.imageUrl ? (
                    <img
                      src={buildBackendAssetUrl(result.imageUrl)}
                      alt={getDiseaseName()}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}
                </div>
              </div>

              {diseaseInfo && (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-teal-900 mb-2">Condition Summary</p>
                  <p className="text-teal-800 text-sm leading-6">{diseaseInfo.short}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-900 font-medium mb-2">Status</p>
                <p className="text-blue-800">
                  {getConfidenceRatio(result.prediction?.confidence) > 0.8 
                    ? '✓ High confidence prediction' 
                    : 'Moderate confidence - consult a professional'}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-amber-900 font-medium mb-2">Next Steps</p>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• Consult with a dermatologist</li>
                  <li>• Follow recommended treatment</li>
                  <li>• Monitor for changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Top Predictions */}
        {result.probabilities && result.probabilities.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Possibilities</h2>
            <div className="space-y-4">
              {result.probabilities.map((prob, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">
                      {index + 1}. {prob.disease}
                    </span>
                    <span className="text-lg font-bold text-teal-600">
                      {(prob.probability * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-500 h-2 rounded-full transition-all"
                      style={{ width: `${prob.probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {diseaseInfo && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Condition Details</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Symptoms</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {diseaseInfo.symptoms?.map((symptom, index) => (
                    <li key={index}>• {symptom}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cautions</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {diseaseInfo.cautions?.map((caution, index) => (
                    <li key={index}>• {caution}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Treatments</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {diseaseInfo.treatments?.map((treatment, index) => (
                    <li key={index}>• {treatment}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Details Section */}
        {result.details && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
            <p className="text-gray-700 leading-relaxed">{result.details}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Analyze Another Image
          </button>
          {/* {result?.prediction?.disease && (
            <button
              onClick={() => navigate(`/disease/${encodeURIComponent(result.prediction.disease)}`)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Learn More
            </button>
          )} */}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> This analysis is AI-generated and should not replace professional medical advice. 
            Always consult with a qualified dermatologist for accurate diagnosis and treatment.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Results;
