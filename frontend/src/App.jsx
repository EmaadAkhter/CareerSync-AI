import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Briefcase, Sparkles, AlertCircle, CheckCircle, TrendingUp, Book, DollarSign } from 'lucide-react';

const QUESTIONS_CONFIG = [
  {
    section: 'Interests',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    questions: [
      { key: 'interests', label: 'What topics or activities genuinely interest you?', required: true },
      { key: 'interests_fulltime', label: 'Could you see yourself working full-time in this area?' },
      { key: 'interests_appeal', label: 'What specifically appeals to you about these interests?' }
    ]
  },
  {
    section: 'Skills',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    questions: [
      { key: 'skills', label: 'What are you naturally good at?', required: true },
      { key: 'skills_natural', label: 'What skills come most naturally to you?' },
      { key: 'skills_energized', label: 'What activities leave you feeling energized?' }
    ]
  },
  {
    section: 'Problem Solving',
    icon: CheckCircle,
    color: 'from-slate-600 to-slate-700',
    questions: [
      { key: 'problem_solving', label: 'What types of problems do you enjoy solving?' },
      { key: 'problem_method', label: 'How do you typically approach problem-solving?' },
      { key: 'problem_enjoy', label: 'What about problem-solving is most satisfying?' }
    ]
  },
  {
    section: 'Work Style',
    icon: Briefcase,
    color: 'from-orange-500 to-amber-500',
    questions: [
      { key: 'work_style', label: 'Do you prefer working alone, in teams, or a mix?' },
      { key: 'work_routine', label: 'Structured routines or flexible schedules?' },
      { key: 'work_goals', label: 'What does success look like to you in a career?' }
    ]
  },
  {
    section: 'Values',
    icon: Book,
    color: 'from-indigo-500 to-blue-600',
    questions: [
      { key: 'values', label: 'What matters most to you in a career?', required: true },
      { key: 'values_why', label: 'Why are these values important to you?' },
      { key: 'values_choice', label: 'How do these values influence your career choices?' }
    ]
  },
  {
    section: 'Inspiration',
    icon: Sparkles,
    color: 'from-rose-500 to-pink-500',
    questions: [
      { key: 'career_inspiration', label: 'What careers or professionals inspire you?' },
      { key: 'inspiration_standout', label: 'What makes them stand out to you?' },
      { key: 'inspiration_pursue', label: 'Would you want to pursue a similar path?' }
    ]
  },
  {
    section: 'Environment',
    icon: TrendingUp,
    color: 'from-teal-500 to-cyan-600',
    questions: [
      { key: 'environment_preference', label: 'What work environment do you thrive in?' },
      { key: 'environment_why', label: 'Why does this environment work best for you?' },
      { key: 'focus_preference', label: 'Do you prefer variety or deep focus?' }
    ]
  },
  {
    section: 'Impact',
    icon: DollarSign,
    color: 'from-gray-600 to-slate-700',
    questions: [
      { key: 'impact_preference', label: 'What kind of impact do you want to make?' },
      { key: 'impact_why', label: 'Why is this impact important to you?' }
    ]
  }
];

const initialFormState = QUESTIONS_CONFIG.reduce((acc, section) => {
  section.questions.forEach(q => { acc[q.key] = ''; });
  return acc;
}, {});

const CareerPathFinder = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const resultsRef = useRef(null);

  const currentSection = QUESTIONS_CONFIG[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS_CONFIG.length) * 100;
  const SectionIcon = currentSection.icon;

  const handleChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateCurrentStep = () => {
    const errors = {};
    currentSection.questions.forEach(q => {
      if (q.required && !formData[q.key]?.trim()) {
        errors[q.key] = 'This field is required';
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < QUESTIONS_CONFIG.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError('');
    setMatches([]);

    try {
      const response = await fetch('https://careersync-ai-1.onrender.com/api/match-careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMatches(data.matches || []);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matches.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [matches]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-gray-800">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 px-4 py-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl mb-6 shadow-2xl">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Career Path Finder
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover careers that align with your passions, skills, and values
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Step {currentStep + 1} of {QUESTIONS_CONFIG.length}
              </span>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${currentSection.color} rounded-2xl shadow-lg`}>
              <SectionIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              {currentSection.section}
            </h2>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {currentSection.questions.map((q, idx) => (
              <div key={q.key} className="group">
                <label className="block mb-3">
                  <span className="text-base font-semibold text-gray-800">
                    {q.label}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </label>
                <textarea
                  value={formData[q.key]}
                  onChange={(e) => handleChange(q.key, e.target.value)}
                  className={`w-full px-5 py-4 border-2 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 resize-none ${
                    validationErrors[q.key] 
                      ? 'border-red-400 bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                  }`}
                  rows={4}
                  placeholder="Share your thoughts in detail..."
                  aria-label={q.label}
                  aria-required={q.required}
                  aria-invalid={!!validationErrors[q.key]}
                />
                {validationErrors[q.key] && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors[q.key]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t-2 border-gray-100">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-8 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95"
            >
              Previous
            </button>

            {currentStep === QUESTIONS_CONFIG.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:scale-105 transition-all duration-200 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Find My Careers'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">Next Step</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Connection Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {matches.length > 0 && (
          <div ref={resultsRef} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-3">
                Your Top Career Matches
              </h2>
              <p className="text-white/70 text-lg">
                Based on your unique profile, here are {matches.length} careers tailored for you
              </p>
            </div>

            {matches.map((match, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                    {match.job_title}
                  </h3>
                  <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-bold shadow-lg">
                    {match.match_percentage.toFixed(1)}% Match
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {match.description}
                </p>

                {/* Reasoning */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Why This Matches You
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {match.reasoning}
                  </p>
                </div>

                {/* Skills */}
                {match.skills && (
                  <div className="mb-6">
                    <h4 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                      <TrendingUp className="w-5 h-5 text-cyan-600" />
                      Required Skills
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {match.skills}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                {(match.salary_range || match.education || match.industry) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t-2 border-gray-100">
                    {match.salary_range && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Salary</div>
                          <div className="text-sm font-bold text-gray-900">{match.salary_range}</div>
                        </div>
                      </div>
                    )}
                    {match.education && (
                      <div className="flex items-center gap-3">
                        <Book className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Education</div>
                          <div className="text-sm font-bold text-gray-900">{match.education}</div>
                        </div>
                      </div>
                    )}
                    {match.industry && (
                      <div className="flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-slate-600" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Industry</div>
                          <div className="text-sm font-bold text-gray-900">{match.industry}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default CareerPathFinder;
