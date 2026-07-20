import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldAlert } from 'lucide-react';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-sm text-gray-500">Password reset is not configured yet.</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This project does not yet include email or OTP password reset. Use your current password, or add a reset API later.
        </div>

        <div className="space-y-4">
          <a
            href="mailto:support@dermadetect.local"
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 font-medium text-white hover:bg-teal-700"
          >
            <Mail className="h-5 w-5" />
            Contact Support
          </a>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;