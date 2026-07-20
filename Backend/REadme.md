import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Local Storage Keys ---
const AUTH_TOKEN_KEY = 'skinDetectAuthToken';
const USER_NAME_KEY = 'skinDetectUserName';
const USER_ID_KEY = 'skinDetectUserId';

// --- API Configuration ---
// NOTE: Frontend is configured to look for the backend on port 3003.
const API_BASE_URL = 'http://localhost:3003/api';

// --- Utility Functions and Hooks ---

// Placeholder ML Model Data (Based on HAM10000 Dataset Categories)
const MOCK_DISEASES = [
  { 
    id: 'MEL', 
    name: "Melanoma (MEL)", 
    type: "Malignant Cancer", 
    confidence: 95.5, 
    description: "The most serious type of skin cancer. Often presents as an asymmetrical mole with irregular borders, varied color, and a diameter greater than 6mm (ABCDE rule). Early detection is critical.", 
    causes: "Exposure to ultraviolet (UV) radiation, both from sun and tanning beds. Genetic factors and having many moles are also risks.",
    symptoms: "A new, unusually shaped, or changing spot on the skin. Itching, bleeding, or non-healing sores.",
    prevention: "Strict sun protection: broad-spectrum SPF 30+, protective clothing, and regular self-examinations.",
    treatment: "Surgical excision is primary; may require immunotherapy, targeted therapy, or chemotherapy for advanced stages."
  },
  { 
    id: 'NV', 
    name: "Melanocytic Nevi (NV) - Common Mole", 
    type: "Benign (Non-cancerous)", 
    confidence: 88.2, 
    description: "Common moles, usually uniform in color (brown or tan), symmetric, with clear, regular borders, and generally small in size. Most are harmless.", 
    causes: "Caused by clusters of pigment cells (melanocytes). Most appear in childhood and adolescence.",
    symptoms: "Typically asymptomatic. Look for symmetry and stable appearance over time.",
    prevention: "Regular monitoring for changes (ABCDE rule).",
    treatment: "Usually none required. Removal is typically only for cosmetic reasons or if change is suspected."
  },
  { 
    id: 'BCC', 
    name: "Basal Cell Carcinoma (BCC)", 
    type: "Malignant Cancer (Low risk)", 
    confidence: 92.1, 
    description: "The most common form of skin cancer. Usually appears as a pearly or translucent bump, or a non-healing sore. Rarely spreads beyond the original site.", 
    causes: "Long-term exposure to UV radiation.",
    symptoms: "Pearly white or pink bump, often with tiny visible blood vessels. May look like a scar or a persistent sore.",
    prevention: "Daily use of sunscreen and minimizing sun exposure.",
    treatment: "Surgical removal (Mohs surgery is common), curettage and electrodessication, or topical creams."
  },
  { 
    id: 'AKIEC', 
    name: "Actinic Keratoses & Intraepithelial Carcinoma (AKIEC)", 
    type: "Pre-cancerous / Carcinoma in situ", 
    confidence: 76.9, 
    description: "Rough, scaly patch on the skin that develops from years of sun exposure. Considered pre-cancerous as it can progress to Squamous Cell Carcinoma (SCC).", 
    causes: "Chronic sun exposure, especially in fair-skinned individuals.",
    symptoms: "Rough, sandpaper-like patches; may be pink, red, or skin-colored. Often tender or itchy.",
    prevention: "Rigorous sun avoidance and use of protective clothing.",
    treatment: "Cryotherapy (freezing), topical chemotherapy creams, or photodynamic therapy."
  },
  { 
    id: 'BKL', 
    name: "Benign Keratosis-like Lesions (BKL)", 
    type: "Benign (Non-cancerous)", 
    confidence: 81.0, 
    description: "Includes Seborrheic Keratoses, which look waxy, scaly, and slightly raised, often appearing 'stuck on' the skin. Harmless, though sometimes mistaken for cancer.", 
    causes: "Common sign of skin aging. Tendency may be inherited.",
    symptoms: "Varying size and color (tan, brown, black). Do not bleed or itch unless irritated.",
    prevention: "None specific, as they are related to genetics/age.",
    treatment: "No treatment necessary. May be removed by freezing or scraping if irritated."
  },
  { 
    id: 'DF', 
    name: "Dermatofibroma (DF)", 
    type: "Benign (Non-cancerous)", 
    confidence: 70.0, 
    description: "A small, firm, reddish-brown bump that often occurs on the legs. It feels hard and dimples inward when squeezed (dimple sign).", 
    causes: "Often develops after a minor injury, insect bite, or ingrown hair.",
    symptoms: "Firm, raised nodule. Often painless, but may occasionally itch.",
    prevention: "None specific.",
    treatment: "Excision is possible but often leaves a scar. Removal is usually only if symptomatic or for aesthetic reasons."
  },
  { 
    id: 'VASC', 
    name: "Vascular Lesions (VASC)", 
    type: "Benign (Non-cancerous)", 
    confidence: 65.0, 
    description: "Lesions resulting from proliferation of blood vessels, such as angiomas or hemangiomas. They appear red, purple, or blue.", 
    causes: "Often genetic or related to aging (e.g., Cherry Angiomas).",
    symptoms: "Bright red spots (like cherry angiomas) or larger blue/purple patches (venous lakes).",
    prevention: "None specific.",
    treatment: "Laser therapy or electrocautery, usually for cosmetic removal."
  },
];


// Mocks the ML model analysis API call (runs client-side simulation)
const analyzeImageLocally = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate ML delay

  // Placeholder logic:
  const result = MOCK_DISEASES[Math.floor(Math.random() * MOCK_DISEASES.length)];
  return {
    ...result,
    confidence: result.confidence + (Math.random() * 5 - 2.5),
  };
};

/**
 * Custom Hook for Toast Notifications
 */
const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastComponent = ({ toast }) => {
    if (!toast) return null;
    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl z-50 transition-transform duration-300 transform";
    const typeClasses = toast.type === 'error'
      ? 'bg-red-500 text-white'
      : 'bg-green-500 text-white';

    return (
      <div className={`${baseClasses} ${typeClasses} translate-y-0 opacity-100`}>
        {toast.message}
      </div>
    );
  };

  return { toast, showToast, ToastComponent };
};

// Helper for local storage persistence (replaces API calls)
const HISTORY_KEY = 'skinDetectHistory';
const USERS_KEY = 'skinDetectUsers';

const mockGetUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const mockSaveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const mockSignup = async ({ fullName, email, password }) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  let users = mockGetUsers();

  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email already in use.' };
  }

  // NOTE: Password saved in plain text for local simulation ONLY
  const newUser = {
    id: Date.now().toString(),
    fullName,
    email,
    password,
  };
  users.push(newUser);
  mockSaveUsers(users);
  return { success: true, message: 'Account created successfully.' };
};

const mockLogin = async ({ email, password }) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const users = mockGetUsers();
  // FIX: Ensure comparison is correct
  const user = users.find(u => u.email === email && u.password === password); 

  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }
  
  // Mock JWT token (simple base64 encoding of user data for simulation)
  const token = btoa(JSON.stringify({ id: user.id, fullName: user.fullName }));
  return { success: true, token, fullName: user.fullName, userId: user.id };
};

const mockGetHistory = (userId) => {
  const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  return allHistory
    .filter(item => item.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);
};

const mockSaveHistoryItem = async ({ userId, diseaseName, confidence, imageUrl }) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const allHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');

  const newItem = {
    id: Date.now().toString() + Math.random().toString().substring(2, 5),
    userId,
    diseaseName,
    confidence,
    imageUrl,
    timestamp: Date.now(),
  };

  allHistory.push(newItem);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(allHistory));
  return { success: true, item: newItem };
};


// Helper for image conversion
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});


// --- Component Icons ---
const EyeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeOffIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-10-7-10-7s.82-1.74 2.11-3.13m4.73-4.73L2 5m2 2l18 18m-4.2-4.2a3 3 0 10-4.2-4.2L16 16"/><path d="M9.9 9.9a3 3 0 00-4.24 4.24m.02.02L2 22M22 2L2 22"/></svg>
);
const SunIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>
);
const MoonIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
);
const UploadIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const HistoryIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.87M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.87"/><path d="M12 7v5l4 2"/></svg>
);
const LockIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
);
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const MailIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M22 7l-9 6L3 7"/></svg>
);
const InfoIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);
const ShieldIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

// --- Component Primitives ---

/** Card Component (Shadcn Style) */
const Card = ({ title, children, className = '', icon: Icon }) => (
  <div className={`dark:bg-gray-800 bg-white p-6 rounded-2xl shadow-xl transition-all duration-300 ${className}`}>
    {title && (
      <div className="flex items-center mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
        {Icon && <Icon className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

/** Input Field Component */
const Input = ({ label, id, type = 'text', value, onChange, placeholder, icon: Icon, error, passwordToggle, showPassword, setShowPassword }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      <input
        type={passwordToggle && !showPassword ? 'password' : type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />}
      {passwordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

/** Button Component */
const Button = ({ children, onClick, disabled, className = '', variant = 'primary', type = 'button' }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryStyle = "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
  const secondaryStyle = "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700";

  const style = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${style} ${className}`}
    >
      {children}
    </button>
  );
};

/** Password Strength Indicator */
const PasswordStrength = ({ password }) => {
  const getStrength = (p) => {
    let score = 0;
    if (!p) return { label: 'Enter a password', color: 'text-gray-400', width: 'w-0' };
    if (p.length > 7) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[a-z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    switch (score) {
      case 0: return { label: 'Very Weak', color: 'text-gray-400', width: 'w-0' };
      case 1: return { label: 'Weak', color: 'text-red-500', width: 'w-1/5' };
      case 2: return { label: 'Moderate', color: 'text-yellow-500', width: 'w-2/5' };
      case 3: return { label: 'Good', color: 'text-green-500', width: 'w-3/5' };
      case 4:
      case 5: return { label: 'Strong', color: 'text-green-600', width: 'w-full' };
      default: return { label: 'Very Weak', color: 'text-red-500', width: 'w-1/5' };
    }
  };

  const { label, color, width } = getStrength(password);

  return (
    <div className="mt-2">
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color === 'text-red-500' ? 'bg-red-500' : color === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-green-500'} ${width}`}
        ></div>
      </div>
      <p className={`text-xs mt-1 ${color}`}>{label}</p>
    </div>
  );
};

/** Nav Link Component */
const NavLink = ({ children, setPage, targetPage, Icon, currentPage }) => {
  const isCurrent = currentPage === targetPage;
  const classes = `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition duration-150 ${
    isCurrent
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
  }`;

  return (
    <button onClick={() => setPage(targetPage)} className={classes}>
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </button>
  );
};

/** Global Header/Navigation Bar */
const Header = ({ isLoggedIn, currentUserName, setPage, toggleTheme, isDarkTheme, onLogout, currentPage }) => (
  <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <span onClick={() => setPage('home')} className="text-xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer transition-colors duration-200 hover:text-blue-800 dark:hover:text-blue-200">
          SkinDetect
        </span>
        {isLoggedIn && (
          <nav className="hidden md:flex space-x-3">
            <NavLink setPage={setPage} targetPage="home" Icon={ShieldIcon} currentPage={currentPage}>Dashboard</NavLink>
            <NavLink setPage={setPage} targetPage="info" Icon={InfoIcon} currentPage={currentPage}>Disease Info</NavLink>
          </nav>
        )}
      </div>

      <nav className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-150"
          aria-label="Toggle dark mode"
        >
          {isDarkTheme ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        {isLoggedIn ? (
          <>
            <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:inline">Hello, {currentUserName}</span>
            <Button onClick={onLogout} variant="secondary" className="px-4 py-2 text-sm">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setPage('login')} variant="secondary" className="px-4 py-2 text-sm hidden sm:block">
              Login
            </Button>
            <Button onClick={() => setPage('signup')} className="px-4 py-2 text-sm">
              Sign Up
            </Button>
          </>
        )}
      </nav>
    </div>
  </header>
);

/** Global Footer */
const Footer = () => (
  <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12 py-6">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400 text-sm">
      © 2024 SkinDetect System. All rights reserved. (Data persisted locally.)
    </div>
  </footer>
);

// --- Page Components ---

/** A. Signup Page */
const SignupPage = ({ setPage, showToast }) => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = 'Full Name is required.';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Valid email is required.';
    if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Using local mock function
      const result = await mockSignup({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      if (result.success) {
        showToast('Account created successfully! Please log in.', 'success');
        setPage('login');
      } else {
        showToast(result.message || 'Signup failed.', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred during signup.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
      <Card title="Create Account" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" id="fullName" name="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="John Doe" icon={UserIcon} error={errors.fullName} />
          <Input label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" icon={MailIcon} error={errors.email} />
          <Input label="Password" id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" icon={LockIcon} error={errors.password} passwordToggle={true} showPassword={showPassword} setShowPassword={setShowPassword} />
          {form.password && <PasswordStrength password={form.password} />}
          <Input label="Confirm Password" id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" icon={LockIcon} error={errors.confirmPassword} passwordToggle={true} showPassword={showPassword} setShowPassword={setShowPassword} />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={() => setPage('login')} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors duration-150">
            Login
          </button>
        </div>
      </Card>
    </div>
  );
};

/** B. Login Page */
const LoginPage = ({ setPage, onLogin, showToast }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required.';
    if (!form.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Using local mock function
      const result = await mockLogin({
        email: form.email,
        password: form.password,
      });

      if (result.success && result.token) {
        showToast('Login successful! Welcome back.', 'success');
        onLogin(result.token, result.fullName, result.userId);
      } else {
        showToast(result.message || 'Login failed: Invalid credentials.', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred during login.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] p-4">
      <Card title="Login to SkinDetect" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" icon={MailIcon} error={errors.email} />
          <Input label="Password" id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" icon={LockIcon} error={errors.password} passwordToggle={true} showPassword={showPassword} setShowPassword={setShowPassword} />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Logging In...' : 'Login'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button onClick={() => setPage('signup')} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors duration-150">
            Sign Up
          </button>
        </div>
      </Card>
    </div>
  );
};

/** D. Skin Disease Information Page */
const DiseaseInfoPage = () => {
  const getSeverityColor = (type) => {
    if (type.includes('Malignant')) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-500';
    if (type.includes('Pre-cancerous')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-500';
    return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-500';
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10 p-6 bg-green-50 dark:bg-gray-800 rounded-2xl shadow-inner">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
          Understanding Skin Lesions
        </h1>
        <p className="text-xl text-green-600 dark:text-green-400 font-medium">
          Detailed information based on the HAM10000 classification.
        </p>
      </div>

      <div className="mb-10 text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
          The following information describes the seven most common categories of pigmented skin lesions found in clinical practice and used for training our detection model.
        </p>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_DISEASES.map((disease) => (
          <Card key={disease.id} title={disease.name} className="flex flex-col h-full hover:shadow-2xl" icon={InfoIcon}>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full w-fit mb-4 border-l-4 ${getSeverityColor(disease.type)}`}>
              {disease.type} ({disease.id})
            </span>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">{disease.description}</p>

            <div className="mt-auto space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Causes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{disease.causes}</p>
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Symptoms</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{disease.symptoms}</p>
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Prevention / Management</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{disease.prevention}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
};


/** C. Home Page (Dashboard) */
const HomePage = ({ userId, showToast, authToken, history, setHistory }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // 1. Fetch History on Load
  const fetchHistory = useCallback(async () => {
    if (!userId || !authToken) return;

    setIsHistoryLoading(true);
    // Using local mock function
    const historyData = mockGetHistory(userId);
    setHistory(historyData);
    setIsHistoryLoading(false);

  }, [userId, authToken, setHistory]);

  useEffect(() => {
    // Only fetch if authenticated
    if (authToken) {
        fetchHistory();
    }
  }, [authToken, fetchHistory]);


  const handleFileChange = (file) => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); 
    
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null); 
    } else {
      showToast('Please select a valid image file.', 'error');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length) handleFileChange(files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyze = async () => {
    if (!imageFile || isAnalyzing || !userId) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
        // 1. Convert file to base64
        const base64Image = await fileToBase64(imageFile);
        
        // 2. Mock ML Call (client-side simulation)
        const mockResult = await analyzeImageLocally();
        
        // Find the full disease object for rich data
        const fullResult = MOCK_DISEASES.find(d => d.name === mockResult.name) || mockResult;

        setAnalysisResult(fullResult);
        showToast('Analysis complete! Saving results to storage.', 'success');

        // 3. Save to Local Storage (replaces API call)
        const saveResult = await mockSaveHistoryItem({
            userId,
            diseaseName: fullResult.name,
            confidence: parseFloat(fullResult.confidence.toFixed(2)),
            imageUrl: base64Image, // Sending base64 URL for mock persistence
        });

        if (saveResult.success) {
            // Re-fetch history to update the list
            fetchHistory();
        } else {
            showToast(`Failed to save analysis history.`, 'error');
        }

    } catch (error) {
        console.error('Analysis failed:', error);
        showToast('Analysis failed or saving history failed.', 'error');
        setAnalysisResult({ name: "Error", confidence: 0, description: "Could not complete analysis.", treatment: "N/A" });
    } finally {
        setIsAnalyzing(false);
    }
  };

  // Upload Section
  const UploadSection = () => (
    <Card title="Upload Skin Image" icon={UploadIcon} className="md:col-span-1 h-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed ${imagePreviewUrl ? 'border-green-500/50' : 'border-blue-300 dark:border-blue-500'} rounded-xl p-8 text-center transition duration-200 hover:border-blue-500 dark:hover:border-blue-300 cursor-pointer`}
        onClick={() => document.getElementById('imageUpload').click()}
      >
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          hidden
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
        <UploadIcon className="mx-auto h-12 w-12 text-blue-500 dark:text-blue-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-300">
          {imagePreviewUrl ? 'Image Selected. Click here to change.' : 'Drag & drop an image here, or click to browse.'}
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, up to 5MB</p>
      </div>

      {imagePreviewUrl && (
        <div className="mt-4 p-4 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Image Preview:</h3>
          <img src={imagePreviewUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-lg border dark:border-gray-700" />
        </div>
      )}

      <Button
        onClick={handleAnalyze}
        disabled={!imageFile || isAnalyzing}
        className="w-full mt-6"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Skin Disease'}
      </Button>
    </Card>
  );

  // Result Panel
  const ResultPanel = () => (
    <Card title="Analysis Result" icon={InfoIcon} className="md:col-span-2 h-full">
      {!analysisResult || analysisResult.name === "Error" ? (
        <div className="text-center p-12 bg-blue-50 dark:bg-gray-700/50 rounded-xl">
          <HistoryIcon className="mx-auto h-12 w-12 text-blue-500/70 dark:text-blue-400/70 mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">
            Upload and analyze an image to see the diagnosis and recommended treatment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border p-4 rounded-xl dark:border-gray-700">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">Predicted Condition:</p>
            <h3 className={`text-3xl font-bold ${analysisResult.confidence > 90 ? 'text-red-500' : analysisResult.confidence > 80 ? 'text-yellow-500' : 'text-green-500'} dark:text-opacity-80`}>
              {analysisResult.name} ({analysisResult.id})
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Confidence: <span className="font-semibold">{analysisResult.confidence.toFixed(2)}%</span>
            </p>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Description</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
              {analysisResult.description}
            </p>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Treatment Suggestions</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-green-50 dark:bg-green-900/40 p-3 rounded-lg border border-green-200 dark:border-green-800">
              {analysisResult.treatment}
            </p>
          </div>
        </div>
      )}
    </Card>
  );

  // History Section
  const HistorySection = () => (
    <Card title="Analysis History" icon={HistoryIcon} className="col-span-full">
      {isHistoryLoading ? (
         <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading history...</p>
      ) : history.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No previous analyses found. Start your first detection!</p>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li
              key={item.id}
              className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition duration-150 border-l-4 border-blue-500 dark:border-blue-400"
            >
              {item.imageUrl && (
                 <img src={item.imageUrl} alt="Scan" className="w-10 h-10 object-cover rounded mr-4 hidden sm:block"/>
              )}
              <div className="flex flex-grow items-center justify-between">
                <div className="flex flex-col truncate">
                  <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.diseaseName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className={`text-lg font-bold ${item.confidence > 90 ? 'text-red-500' : item.confidence > 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {item.confidence.toFixed(2)}%
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Enhanced Hero Section */}
      <div className="text-center mb-10 p-8 bg-gradient-to-r from-blue-100 to-green-100 dark:from-gray-700 dark:to-gray-800 rounded-3xl shadow-xl border border-blue-200 dark:border-gray-700">
        <div className="flex justify-center items-center mb-4">
          <ShieldIcon className="w-12 h-12 text-blue-700 dark:text-blue-400 mr-3 animate-pulse" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">
            Smart Skin Health Analyzer
          </h1>
        </div>
        <p className="text-xl text-blue-800 dark:text-blue-300 font-medium">
          Powered by a model trained on leading dermatological datasets.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-4xl mx-auto">
          Use the dashboard below to upload images for AI-assisted detection of common skin lesions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {UploadSection()}
        {ResultPanel()}
        {HistorySection()}
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        User ID: <span className="font-mono text-xs p-1 bg-gray-200 dark:bg-gray-700 rounded-md select-all">{userId}</span>
      </p>
    </main>
  );
};


// --- Main Application Component (Router) ---
const App = () => {
  const [page, setPage] = useState('home'); 
  const [authToken, setAuthToken] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]); 
  
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('dark-mode') === 'true';
  });

  const { toast, showToast, ToastComponent } = useToast();

  const isLoggedIn = useMemo(() => !!authToken, [authToken]);

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };
  
  const handleLogin = useCallback((token, fullName, id) => {
    setAuthToken(token);
    setCurrentUserName(fullName);
    setUserId(id);
    // Save token and user info to localStorage for session persistence
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_NAME_KEY, fullName);
    localStorage.setItem(USER_ID_KEY, id);
    setPage('home'); // Redirect to dashboard
  }, []);

  const handleLogout = useCallback(() => {
    setAuthToken(null);
    setCurrentUserName(null);
    setUserId(null);
    setHistory([]);
    setPage('login');
    // Clear user session data from localStorage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_ID_KEY);
    showToast('You have been logged out.', 'success');
  }, [showToast]);
  
  // Initial load: Check for existing token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUserName = localStorage.getItem(USER_NAME_KEY);
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedToken && storedUserName && storedUserId) {
        setAuthToken(storedToken);
        setCurrentUserName(storedUserName);
        setUserId(storedUserId);
        setPage('home'); 
    } else {
        setPage('login');
    }
  }, []);


  // Determine current content based on authentication and page state
  const renderPage = () => {
    
    if (page === 'signup') {
      return <SignupPage setPage={setPage} showToast={showToast} />;
    }

    if (page === 'login') {
      return <LoginPage setPage={setPage} onLogin={handleLogin} showToast={showToast} />;
    }
    
    // Protected Route Logic: Reroute to login if trying to access home without authentication
    if (page === 'home' && !isLoggedIn) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] p-6 text-center">
          <LockIcon className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You must be logged in to view the detection dashboard.
          </p>
          <Button onClick={() => setPage('login')}>
            Go to Login
          </Button>
        </div>
      );
    }
    
    // Authenticated Pages
    if (page === 'home') {
      return (
        <HomePage 
          userId={userId} 
          authToken={authToken} // Passed for API call headers, though mock uses local storage
          history={history} 
          setHistory={setHistory} 
          showToast={showToast} 
        />
      );
    }
    
    if (page === 'info') {
      // Info page is publicly accessible
      return <DiseaseInfoPage />;
    }

    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <p className="text-xl text-gray-500 dark:text-gray-400">404 Page Not Found</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Header
        isLoggedIn={isLoggedIn}
        currentUserName={currentUserName || 'Guest'}
        setPage={setPage}
        toggleTheme={toggleTheme}
        isDarkTheme={isDarkTheme}
        onLogout={handleLogout}
        currentPage={page}
      />
      <div className="flex-grow">
        {renderPage()}
      </div>
      <Footer />
      <ToastComponent toast={toast} />
    </div>
  );
};

export default App;