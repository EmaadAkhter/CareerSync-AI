import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Briefcase, Sparkles, AlertCircle, CheckCircle, TrendingUp, Book, 
  DollarSign, ChevronRight, ChevronLeft, Globe, GraduationCap, 
  Upload, FileText, Loader2, RefreshCw, Layers 
} from 'lucide-react';

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
  const [mode, setMode] = useState('resume'); // 'form' or 'resume'
  const [formData, setFormData] = useState(initialFormState);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  
  const resultsRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setUploadFile(file);
        setError('');
      } else {
        setError('Please upload a PDF or .docx file');
        setUploadFile(null);
      }
    }
  };

  const handleResumeSubmit = async () => {
    if (!uploadFile) {
      setError('Please select a resume file first');
      return;
    }

    setLoading(true);
    setError('');
    setMatches([]);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', uploadFile);

      const response = await fetch('https://careersync-ai-guo8.onrender.com/api/match-resume', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
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
      setMatches(data.matches || []);
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
            <span className="text-gradient">CareerSync AI</span>
            <span className="block h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 mt-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse" />
          </h1>
          
          <p className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed mt-6">
            Intelligent career DNA matching. Upload your resume or solve the pathfinder form.
          </p>

          {/* Mode Switcher */}
          <div className="flex bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 w-fit mx-auto mt-10">
            <button 
              onClick={() => { setMode('resume'); setMatches([]); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === 'resume' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Professional Mode
            </button>
            <button 
              onClick={() => { setMode('form'); setMatches([]); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Pathfinder Mode
            </button>
          </div>
        </header>

        {/* Main Interface Container */}
        <main className="fade-up" style={{ animationDelay: '0.2s' }}>
          {mode === 'resume' ? (
            /* Resume Mode Component */
            <div className="glass-card rounded-[32px] p-8 md:p-12 mb-12 text-center border-white/5">
              <div 
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'; }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                onDrop={(e) => { e.preventDefault(); handleFileChange({ target: { files: e.dataTransfer.files } }); }}
                className="group relative cursor-pointer border-2 border-dashed border-white/10 rounded-3xl p-16 transition-all duration-500 hover:bg-blue-500/5 hover:border-blue-500/30"
              >
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                />
                
                {uploadFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                      <CheckCircle className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{uploadFile.name}</h3>
                    <p className="text-slate-400 uppercase tracking-widest text-[10px] font-black">
                      File Ready for analysis
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                      className="mt-6 text-rose-400 text-xs font-bold uppercase tracking-widest hover:text-rose-300 transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                      <Upload className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Upload your resume</h3>
                    <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Drag and drop your <span className="text-blue-400">PDF</span> or <span className="text-blue-400">DOCX</span> to extract your professional DNA.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleResumeSubmit}
                  disabled={loading || !uploadFile}
                  className={`relative px-12 py-5 rounded-2xl font-extrabold text-white transition-all duration-300 active:scale-95 shadow-2xl flex items-center gap-3 ${
                    loading || !uploadFile
                      ? 'bg-slate-700 opacity-50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing Professional DNA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>Start Matching Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Pathfinder Mode Component */
            <div className="glass-card rounded-[32px] p-8 md:p-12 mb-12 border-white/5">
              {/* Step Indicator */}
              <div className="flex flex-col gap-4 mb-12">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      {currentSection.section} <span className="text-slate-500 ml-2">({currentStep + 1}/{QUESTIONS_CONFIG.length})</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-extrabold italic text-primary-gradient">
                      {Math.round(progress)}%
                    </p>
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full progress-fill rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-700" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-10">
                {currentSection.questions.map((q) => (
                  <div key={q.key} className="group">
                    <label className="block mb-4">
                      <span className="text-lg font-semibold text-slate-200 group-focus-within:text-blue-400 transition-colors">
                        {q.label}
                        {q.required && <span className="text-rose-500 ml-1.5">*</span>}
                      </span>
                    </label>
                    <textarea
                      value={formData[q.key]}
                      onChange={(e) => handleChange(q.key, e.target.value)}
                      className={`glass-input w-full px-6 py-5 rounded-2xl text-lg min-h-[140px] focus:outline-none placeholder-slate-700 resize-none ${
                         validationErrors[q.key] ? 'border-rose-500/50' : ''
                      }`}
                      placeholder="Share your experience..."
                    />
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-16 pt-10 border-t border-white/5">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    currentStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous Step
                </button>

                {currentStep === QUESTIONS_CONFIG.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="relative px-12 py-5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:shadow-blue-500/40 transition-all duration-300 active:scale-95 shadow-2xl flex items-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    {loading ? 'Analyzing...' : 'Finish Profile'}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-slate-950 font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Error State */}
        {error && (
          <div className="glass-card mb-12 border-rose-500/30 bg-rose-500/5 p-8 rounded-[24px] shadow-lg">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-rose-400 mt-1" />
              <div>
                <h4 className="text-xl font-bold text-rose-200 mb-1">System Error</h4>
                <p className="text-rose-300 opacity-80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Visualizer */}
        {matches.length > 0 && (
          <section ref={resultsRef} className="space-y-12 pb-32">
            <div className="text-center mb-16 pt-8">
              <div className="inline-block px-4 py-1.5 rounded-full glass border-white/10 mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">AI Vector Match Result</span>
              </div>
              <h2 className="text-5xl font-extrabold text-white mb-6">Discovery Engine Results</h2>
            </div>

            <div className="space-y-8">
              {matches.map((match, idx) => (
                <div key={idx} className="glass-card rounded-[32px] group hover:border-blue-500/30 border border-white/5 transition-all duration-500 p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                    <div>
                      <h3 className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors mb-4 leading-tight">
                        {match.job_title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 rounded-lg glass-input text-[11px] font-black uppercase tracking-widest border-white/5 bg-white/5">
                          {match.industry || 'Global Sector'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="glass-card border-white/10 px-8 py-5 rounded-[20px] text-center min-w-[140px]">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Affinity</p>
                      <p className="text-4xl font-black text-primary-gradient">
                        {Math.round(match.match_percentage)}%
                      </p>
                    </div>
                  </div>

                  <p className="text-xl text-slate-300/80 leading-relaxed mb-10">
                    {match.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-8 mb-10 p-8 rounded-[24px] bg-slate-950/40 border border-white/5">
                    <div>
                      <div className="flex items-center gap-3 mb-4 text-blue-400 font-bold">
                        <CheckCircle className="w-5 h-5" />
                        <span>Resonance Matrix</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-sm italic italic">
                        "{match.reasoning}"
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-4 text-cyan-400 font-bold">
                        <TrendingUp className="w-5 h-5" />
                        <span>Core Indicators</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {match.skills ? match.skills.split(',').map((s, i) => (
                          <span key={i} className="px-3 py-1 glass-input rounded-md">{s.trim()}</span>
                        )) : 'General Proficiency'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-10 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Potential
                      </span>
                      <p className="text-white font-bold">{match.salary_range || 'Competitive'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <GraduationCap className="w-3 h-3" /> Baseline
                      </span>
                      <p className="text-white font-bold">{match.education || 'Self-Guided'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Industry
                      </span>
                      <p className="text-white font-bold text-sm truncate">{match.industry || 'Market Wide'}</p>
                    </div>

                    <div className="flex items-end justify-end">
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-all group/btn">
                        Deep Profile Report
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-20">
              <button 
                onClick={() => { setMatches([]); setUploadFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/5 transition-all font-bold text-slate-300"
              >
                <RefreshCw className="w-5 h-5" />
                Reset Selection
              </button>
            </div>
          </section>
        )}
      </div>

      <footer className="max-w-4xl mx-auto py-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 opacity-40 mt-32">
        <div className="flex items-center gap-4">
          <Briefcase className="w-6 h-6" />
          <span className="font-bold tracking-tighter">CareerSync Pulse v0.5.2</span>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
          <a href="#" className="hover:text-blue-400 tracking-[0.2em]">Neural Status: Ready</a>
        </div>
      </footer>
    </div>
  );
};

export default CareerPathFinder;
