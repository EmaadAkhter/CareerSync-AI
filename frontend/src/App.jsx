import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Briefcase, Sparkles, AlertCircle, CheckCircle, TrendingUp, Book, 
  DollarSign, ChevronRight, ChevronLeft, Globe, GraduationCap, 
  RefreshCw, Layers, Zap, X, Heart, Search, MousePointer2 
} from 'lucide-react';

const DISCOVERY_CARDS = [
  { id: 1, trait: 'Deep technical puzzles & algorithms', query: 'complex problem solving, software engineering, algorithms' },
  { id: 2, trait: 'Leading creative projects & design', query: 'creative direction, UI/UX design, art direction' },
  { id: 3, trait: 'Making a direct impact on people', query: 'social work, healthcare, counseling, education' },
  { id: 4, trait: 'Working with physical tools & hardware', query: 'mechanical engineering, hardware, manufacturing' },
  { id: 5, trait: 'Strategic business & leadership', query: 'business strategy, management, entrepreneurship' },
  { id: 6, trait: 'Analyzing data & finding patterns', query: 'data science, market research, statistics' },
  { id: 7, trait: 'Writing, storytelling & communication', query: 'creative writing, journalism, marketing, PR' },
  { id: 8, trait: 'Environmental impact & sustainability', query: 'environmental science, renewable energy, ecology' },
  { id: 9, trait: 'Financial markets & quantitative analysis', query: 'finance, fintech, investment banking, trading' },
  { id: 10, trait: 'Legal strategy & professional ethics', query: 'law, compliance, ethics, policy development' },
  { id: 11, trait: 'Scientific research & discovery', query: 'scientific research, R&D, biotechnology, physics' },
  { id: 12, trait: 'Helping customers & client relations', query: 'customer success, sales, client management' },
  { id: 13, trait: 'Optimizing systems & efficiency', query: 'process improvement, logistics, supply chain' },
  { id: 14, trait: 'Mentoring & teaching others', query: 'mentorship, corporate training, academic education' },
  { id: 15, trait: 'Exploring new technologies (AI, Web3)', query: 'emerging technology, artificial intelligence, blockchain' }
];

const QUESTIONS_CONFIG = [
  {
    section: 'Interests',
    icon: Sparkles,
    questions: [
      { key: 'interests', label: 'What topics or activities genuinely interest you?', required: true },
      { key: 'interests_fulltime', label: 'Could you see yourself working full-time in this area?' }
    ]
  },
  {
    section: 'Skills',
    icon: TrendingUp,
    questions: [
      { key: 'skills', label: 'What are you naturally good at?', required: true },
      { key: 'skills_energized', label: 'What activities leave you feeling energized?' }
    ]
  },
  {
    section: 'Impact',
    icon: DollarSign,
    questions: [
      { key: 'values', label: 'What matters most to you in a career?', required: true },
      { key: 'impact_preference', label: 'What kind of impact do you want to make?' }
    ]
  }
];

const initialFormState = QUESTIONS_CONFIG.reduce((acc, section) => {
  section.questions.forEach(q => { acc[q.key] = ''; });
  return acc;
}, {});

const DiscoverySwiper = ({ onDiscoveryComplete, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [positiveTraits, setPositiveTraits] = useState([]);
  const [swipeDir, setSwipeDir] = useState(null);

  const currentCard = DISCOVERY_CARDS[currentIndex];

  const handleSwipe = (isPositive) => {
    setSwipeDir(isPositive ? 'right' : 'left');
    
    setTimeout(() => {
      if (isPositive) {
        setPositiveTraits(prev => [...prev, currentCard.query]);
      }
      
      if (currentIndex < DISCOVERY_CARDS.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSwipeDir(null);
      } else {
        // End of deck
        onDiscoveryComplete([...positiveTraits, isPositive ? currentCard.query : null].filter(Boolean));
      }
    }, 300);
  };

  return (
    <div className="max-w-md mx-auto relative h-[480px] flex flex-col justify-between fade-in">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-[#71717a] font-bold mb-2">
          Discovery engine: Card {currentIndex + 1} / {DISCOVERY_CARDS.length}
        </p>
        <h3 className="text-xl font-bold">Swipe to find your resonance</h3>
      </div>

      <div className="relative flex-grow flex items-center justify-center">
        {currentIndex < DISCOVERY_CARDS.length ? (
          <div className={`discovery-card glass-panel w-full aspect-[3/4] p-8 flex flex-col items-center justify-center text-center select-none ${
            swipeDir === 'right' ? 'swipe-right' : swipeDir === 'left' ? 'swipe-left' : ''
          }`}>
            <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-10 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <Zap className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black leading-tight">
              {currentCard.trait}
            </p>
            <div className="absolute bottom-10 flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest items-center">
               <MousePointer2 className="w-3 h-3" />
               Tap or use buttons
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="font-bold">DNA Analysis in progress...</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-8 mt-12">
        <button 
          onClick={() => handleSwipe(false)}
          className="w-20 h-20 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all hover:scale-110 active:scale-95 shadow-xl"
        >
          <X className="w-8 h-8" />
        </button>
        <button 
          onClick={() => handleSwipe(true)}
          className="w-20 h-20 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-all hover:scale-110 active:scale-95 shadow-xl shadow-emerald-500/10"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

const ResultsList = ({ matches, onReset }) => {
  const resultsRef = useRef(null);

  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <section ref={resultsRef} className="space-y-12 pb-32 fade-in">
      <div className="text-center mb-16 pt-12">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-900/40 border border-indigo-500/30 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Match Profile Generated</span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-white mb-6">Discovery Pulse Results</h2>
        <p className="text-[#a1a1aa] leading-relaxed max-w-2xl mx-auto">
          We analyzed your trait resonance across {matches.length} specialized career markers. 
          Here are your high-frequency paths.
        </p>
      </div>

      <div className="grid gap-8">
        {matches.map((match, idx) => (
          <div key={idx} className="glass-panel rounded-[32px] overflow-hidden group hover:border-indigo-500/40 transition-all duration-500 p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
              <div className="flex-grow">
                <h3 className="text-4xl font-extrabold text-white mb-4 leading-tight group-hover:text-indigo-400 transition-colors">
                  {match.job_title}
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#71717a]">
                    {match.industry || 'Market Wide'}
                  </span>
                </div>
              </div>
              
              <div className="bg-black/40 border border-white/5 px-8 pt-6 pb-5 rounded-[24px] text-center min-w-[150px] shadow-2xl">
                <p className="text-[10px] font-black text-[#52525b] uppercase tracking-widest mb-1">Affinity Rank</p>
                <p className="text-5xl font-black text-indigo-500 italic">
                  {Math.round(match.match_percentage)}%
                </p>
              </div>
            </div>

            <p className="text-xl text-[#d4d4d8] leading-relaxed mb-10 opacity-80 group-hover:opacity-100 transition-opacity">
              {match.description}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10 p-8 rounded-[28px] bg-black/40 border border-white/5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                  <Heart className="w-5 h-5" />
                  <span>The Resonance</span>
                </div>
                <p className="text-sm leading-relaxed text-[#71717a] italic italic">
                  "{match.reasoning}"
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                  <Search className="w-5 h-5" />
                  <span>Core Markers</span>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest text-[#52525b]">
                  {match.skills ? match.skills.split(',').map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg">{s.trim()}</span>
                  )) : 'General Professionalism'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 pt-10 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#52525b] flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Potential
                </p>
                <p className="text-white font-bold">{match.salary_range || 'Competitive'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#52525b] flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" /> Baseline
                </p>
                <p className="text-white font-bold">{match.education || 'Self-Guided'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#52525b] flex items-center gap-2">
                   <Globe className="w-3 h-3" /> Market
                </p>
                <p className="text-white font-bold text-sm truncate">{match.industry || 'General'}</p>
              </div>

              <div className="flex justify-end items-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-white transition-all flex items-center gap-2 group/btn">
                  Full Dossier
                  <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-20">
        <button 
          onClick={onReset}
          className="btn-secondary flex items-center gap-3 px-10 py-5"
        >
          <RefreshCw className="w-5 h-5" />
          Reset Neural Pulse
        </button>
      </div>
    </section>
  );
};

const PathfinderForm = ({ loading, onSubmit }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});

  const section = QUESTIONS_CONFIG[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS_CONFIG.length) * 100;

  const handleNext = () => {
    let newErrors = {};
    section.questions.forEach(q => {
      if (q.required && !formData[q.key]) newErrors[q.key] = true;
    });
    
    if (Object.keys(newErrors).length === 0) {
      if (currentStep < QUESTIONS_CONFIG.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onSubmit(formData);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="glass-panel rounded-[32px] p-8 md:p-12 mb-12 fade-in">
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#52525b]">Step {currentStep + 1} of 3</p>
          <p className="text-4xl font-black italic title-gradient">{Math.round(progress)}%</p>
        </div>
        <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-12">
        {section.questions.map((q) => (
          <div key={q.key} className="space-y-4">
            <label className="block text-xl font-bold text-[#e4e4e7]">
              {q.label}
              {q.required && <span className="text-indigo-500 ml-2">*</span>}
            </label>
            <textarea
              value={formData[q.key]}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, [q.key]: e.target.value }));
                setErrors(prev => ({ ...prev, [q.key]: false }));
              }}
              className={`w-full bg-[#09090b]/50 border-2 rounded-2xl p-6 text-lg min-h-[160px] focus:outline-none transition-all ${
                errors[q.key] ? 'border-indigo-500/30' : 'border-white/5 focus:border-indigo-500/50'
              }`}
              placeholder="Detailed input for high-fidelity matching..."
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-20 pt-10 border-t border-white/5">
        <button 
          onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
          className={`flex items-center gap-2 font-bold text-slate-500 ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:text-white'}`}
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={handleNext} disabled={loading} className="btn-vivid flex items-center gap-2 px-12">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : currentStep === QUESTIONS_CONFIG.length - 1 ? 'Analyze Path' : 'Continue'}
          {!loading && <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [mode, setMode] = useState('discovery'); // 'discovery' or 'form'
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiscovery = async (traits) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://careersync-ai-guo8.onrender.com/api/match-careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          interests: traits.join(', '),
          skills: 'profiled via trait resonance',
          values: 'discovery engine matches'
        })
      });

      if (!response.ok) throw new Error(`Engine error: ${response.status}`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://careersync-ai-guo8.onrender.com/api/match-careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(`Engine error: ${response.status}`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-32 px-6">
      <div className="bg-obsidian" />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-20 fade-in">
          <div className="inline-flex items-center justify-center p-6 rounded-[32px] glass-panel mb-10 relative group">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <Briefcase className="w-10 h-10 text-indigo-400 relative z-10" />
          </div>
          
          <h1 className="text-7xl font-black tracking-tighter mb-6 title-gradient leading-tight">
            CareerSync AI
          </h1>
          
          <p className="text-xl text-[#71717a] max-w-2xl mx-auto leading-relaxed">
            Stop searching. Start <span className="text-white italic">resonating</span>. 
            Choose your discovery method below.
          </p>

          {!matches.length && (
            <div className="flex bg-[#18181b] border border-white/5 p-1 rounded-2xl w-fit mx-auto mt-12 shadow-2xl">
              <button 
                onClick={() => setMode('discovery')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  mode === 'discovery' ? 'bg-indigo-600 text-white shadow-[0_0_20px_var(--primary-glow)]' : 'text-[#52525b] hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" /> Discovery Mode
              </button>
              <button 
                onClick={() => setMode('form')}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  mode === 'form' ? 'bg-indigo-600 text-white shadow-[0_0_20px_var(--primary-glow)]' : 'text-[#52525b] hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" /> Deep Pathfinder
              </button>
            </div>
          )}
        </header>

        <main>
          {error && (
            <div className="glass-panel border-rose-500/30 p-8 rounded-3xl mb-12 flex gap-4 items-center fade-in">
              <AlertCircle className="w-6 h-6 text-rose-500" />
              <p className="text-rose-200 font-bold tracking-tight">{error}</p>
            </div>
          )}

          {matches.length > 0 ? (
            <ResultsList matches={matches} onReset={() => setMatches([])} />
          ) : mode === 'discovery' ? (
            <DiscoverySwiper onDiscoveryComplete={handleDiscovery} loading={loading} />
          ) : (
            <PathfinderForm onDiscoveryComplete={handleFormSubmit} loading={loading} />
          )}
        </main>

        <footer className="mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 text-[#3f3f46]">
          <div className="flex items-center gap-3">
            <span className="font-black tracking-tighter text-lg uppercase text-[#27272a]">Pulse System v0.6</span>
          </div>
          <div className="flex gap-10 text-[9px] font-black uppercase tracking-[0.3em]">
             <span className="text-emerald-500/60">Neural Engine: Nominal</span>
             <span className="text-indigo-500/60">Vector Match: Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
