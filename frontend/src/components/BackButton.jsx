import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ label = 'Back', fallbackPath = '/', className = '' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(fallbackPath);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      {label}
    </button>
  );
};

export default BackButton;