import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Briefcase, Sparkles, AlertCircle, CheckCircle, TrendingUp, Book, DollarSign, ChevronRight, ChevronLeft, Globe, GraduationCap } from 'lucide-react';

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
    color: 'from-slate-600 to-slate-800',
    questions: [
      { key: 'problem_solving', label: 'What types of problems do you enjoy solving?' },
      { key: 'problem_method', label: 'How do you typically approach problem-solving?' },
      { key: 'problem_enjoy', label: 'What about problem-solving is most satisfying?' }
    ]
  },
  {
    section: 'Work Style',
    icon: Briefcase,
    color: 'from-orange-500 to-red-500',
    questions: [
      { key: 'work_style', label: 'Do you prefer working alone, in teams, or a mix?' },
      { key: 'work_routine', label: 'Structured routines or flexible schedules?' },
      { key: 'work_goals', label: 'What does success look like to you in a career?' }
    ]
  },
  {
    section: 'Values',
    icon: Book,
    color: 'from-indigo-500 to-purple-500',
    questions: [
      { key: 'values', label: 'What matters most to you in a career?', required: true },
      { key: 'values_why', label: 'Why are these values important to you?' },
      { key: 'values_choice', label: 'How do these values influence your career choices?' }
    ]
  },
  {
    section: 'Inspiration',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
    questions: [
      { key: 'career_inspiration', label: 'What careers or professionals inspire you?' },
      { key: 'inspiration_standout', label: 'What makes them stand out to you?' },
      { key: 'inspiration_pursue', label: 'Would you want to pursue a similar path?' }
    ]
  },
  {
    section: 'Environment',
    icon: TrendingUp,
    color: 'from-teal-500 to-cyan-500',
    questions: [
      { key: 'environment_preference', label: 'What work environment do you thrive in?' },
      { key: 'environment_why', label: 'Why does this environment work best for you?' },
      { key: 'focus_preference', label: 'Do you prefer variety or deep focus?' }
    ]
  },
  {
    section: 'Impact',
    icon: DollarSign,
    color: 'from-slate-500 to-indigo-600',
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
      const response = await fetch('https://careersync-ai-guo8.onrender.com/api/match-careers', {
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
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', marginTop: '40px' });
    }
  }, [matches]);

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 font-plus-jakarta relative">
      <div className="bg-mesh" />
      
      {/* Dynamic Glass Blobs */}
      <div className="glass-blob w-96 h-96 bg-blue-600/20 top-[-10%] left-[-10%]" />
      <div className="glass-blob w-80 h-80 bg-indigo-600/20 bottom-[-5%] right-[-5%]" />
      <div className="glass-blob w-72 h-72 bg-cyan-600/20 top-[40%] right-[10%] opacity-50" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-16 fade-up">
          <div className="inline-flex items-center justify-center p-5 mb-8 rounded-3xl glass shadow-2xl relative group">
            <div className="absolute inset-0 bg-blue-500/30 blur-2xl group-hover:bg-blue-400/40 transition-all duration-500" />
            <Briefcase className="w-12 h-12 text-white relative z-10" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4 inline-block">
            <span className="text-gradient">Career Path Finder</span>
            <span className="block h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 mt-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse" />
          </h1>
          
          <p className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed mt-6">
            Discover careers that align with your <span className="text-blue-400 font-semibold">passions</span>, 
            <span className="text-cyan-400 font-semibold"> skills</span>, and 
            <span className="text-indigo-400 font-semibold"> values</span> using our advanced AI-matching engine.
          </p>
        </header>

        {/* Form Container */}
        <main className="glass-card rounded-[32px] p-8 md:p-12 mb-12 fade-up" style={{ animationDelay: '0.2s' }}>
          {/* Step Indicator */}
          <div className="flex flex-col gap-4 mb-12">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Status</p>
                <h3 className="text-xl font-bold text-white">
                  {currentSection.section} <span className="text-slate-500 ml-2">({currentStep + 1}/{QUESTIONS_CONFIG.length})</span>
                </h3>
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold italic text-primary-gradient">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
            
            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full progress-fill rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-700 ease-in-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center gap-6 mb-10">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentSection.color} shadow-lg shadow-black/20`}>
              <SectionIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">{currentSection.section} Analysis</h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-10">
            {currentSection.questions.map((q) => (
              <div key={q.key} className="group transition-all duration-300">
                <label className="block mb-4">
                  <span className="text-lg font-semibold text-slate-200 group-focus-within:text-blue-400 transition-colors">
                    {q.label}
                    {q.required && <span className="text-rose-500 ml-1.5">*</span>}
                  </span>
                </label>
                
                <div className="relative">
                  <textarea
                    value={formData[q.key]}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    className={`glass-input w-full px-6 py-5 rounded-2xl text-lg min-h-[140px] focus:outline-none placeholder-slate-600 resize-none ${
                       validationErrors[q.key] ? 'border-rose-500/50 bg-rose-500/5' : ''
                    }`}
                    placeholder="Describe your thoughts in detail..."
                  />
                  {validationErrors[q.key] && (
                    <div className="absolute -bottom-7 l-2 flex items-center gap-2 text-rose-400 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>{validationErrors[q.key]}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-16 pt-10 border-t border-white/5">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 border border-white/10 ${
                currentStep === 0 
                  ? 'opacity-20 cursor-not-allowed' 
                  : 'hover:bg-white/5 hover:border-white/20 active:scale-95 text-slate-300 hover:text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep === QUESTIONS_CONFIG.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`relative px-12 py-5 rounded-2xl font-extrabold text-white transition-all duration-300 active:scale-95 shadow-2xl flex items-center gap-3 ${
                  loading 
                    ? 'bg-slate-700 cursor-wait' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing DNA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Find My Path</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-slate-950 font-extrabold transition-all duration-300 hover:bg-slate-100 hover:shadow-xl hover:shadow-white/10 active:scale-95"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </main>

        {/* Error State */}
        {error && (
          <div className="glass-card mb-12 border-rose-500/30 bg-rose-500/5 p-8 rounded-[24px] fade-up shadow-lg">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-rose-200 mb-1">System Interruption</h4>
                <p className="text-rose-300 opacity-80 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Visualizer */}
        {matches.length > 0 && (
          <section ref={resultsRef} className="space-y-12 pb-32 fade-up">
            <div className="text-center mb-16 pt-8">
              <div className="inline-block px-4 py-1.5 rounded-full glass border-white/10 mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Match Results</span>
              </div>
              <h2 className="text-5xl font-extrabold text-white mb-6">Your Evolution Profile</h2>
              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Our AI has analyzed your input against {matches.length} specialized career sectors. 
                Here are the paths where your potential shines brightest.
              </p>
            </div>

            <div className="space-y-8">
              {matches.map((match, idx) => (
                <div 
                  key={idx} 
                  className="glass-card rounded-[32px] overflow-hidden group hover:border-blue-500/30 border border-white/5 transition-all duration-500"
                >
                  <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                      <div>
                        <h3 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors mb-4 leading-tight">
                          {match.job_title}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="px-4 py-1.5 rounded-lg glass-input text-sm font-bold border-white/5 bg-white/5">
                            {match.industry || 'Tech Sector'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative group/score">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover/score:opacity-100 transition-opacity duration-700" />
                        <div className="relative glass-card border-white/10 px-8 py-5 rounded-[20px] text-center">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-tighter mb-1">Affinity</p>
                          <p className="text-4xl font-black text-primary-gradient">
                            {Math.round(match.match_percentage)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xl text-slate-300/90 leading-relaxed mb-10">
                      {match.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                      {/* Why Section */}
                      <div className="p-8 rounded-[24px] bg-slate-950/40 border border-white/5 backdrop-blur-sm grayscale hover:grayscale-0 transition-all duration-500 hover:border-blue-500/20">
                        <div className="flex items-center gap-3 mb-4 text-blue-400">
                          <CheckCircle className="w-6 h-6" />
                          <h4 className="text-lg font-bold">The Resonance</h4>
                        </div>
                        <p className="text-slate-400 leading-relaxed italic">
                          "{match.reasoning}"
                        </p>
                      </div>

                      {/* Skills Section */}
                      <div className="p-8 rounded-[24px] bg-slate-950/40 border border-white/5 backdrop-blur-sm grayscale hover:grayscale-0 transition-all duration-500 hover:border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-4 text-cyan-400">
                          <TrendingUp className="w-6 h-6" />
                          <h4 className="text-lg font-bold">DNA Markers</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 uppercase font-black text-[10px] tracking-widest text-slate-500">
                          {match.skills ? match.skills.split(',').map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 rounded-md border border-white/5">{s.trim()}</span>
                          )) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Potential</span>
                        </div>
                        <p className="text-white font-bold">{match.salary_range || 'Competitive'}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <GraduationCap className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Baseline</span>
                        </div>
                        <p className="text-white font-bold">{match.education || 'Self-Taught / Degree'}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <Globe className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Global Focus</span>
                        </div>
                        <p className="text-white font-bold">{match.industry || 'Market Wide'}</p>
                      </div>

                      <div className="grid grid-cols-1 mt-auto">
                        <button className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 ml-auto group/learn">
                          Deep Dive Profile
                          <ChevronRight className="w-4 h-4 transition-transform group-hover/learn:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="max-w-4xl mx-auto py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 opacity-40">
        <div className="flex items-center gap-4">
          <Briefcase className="w-6 h-6" />
          <span className="font-bold tracking-tighter">CareerSync AI v0.4.5</span>
        </div>
        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-blue-400">System Status</a>
          <a href="#" className="hover:text-blue-400">Data Privacy</a>
          <a href="#" className="hover:text-blue-400">Neural Log</a>
        </div>
      </footer>
    </div>
  );
};

export default CareerPathFinder;
