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

const DiscoverySwiper = ({ onDiscoveryComplete }) => {
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
        onDiscoveryComplete([...positiveTraits, isPositive ? currentCard.query : null].filter(Boolean));
      }
    }, 400);
  };

  return (
    <div className="discovery-container" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#52525b', fontWeight: 900, marginBottom: '0.5rem' }}>
          Discovery engine: Card {currentIndex + 1} / {DISCOVERY_CARDS.length}
        </p>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Swipe to find your resonance</h3>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem' }}>
        {currentIndex < DISCOVERY_CARDS.length && (
          <div className={`discovery-card-stable ${swipeDir === 'right' ? 'swipe-right-anim' : swipeDir === 'left' ? 'swipe-left-anim' : ''}`}>
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '2.5rem', margin: '0 auto 2.5rem' }}>
              <Zap style={{ width: '2rem', height: '2rem', color: '#818cf8', margin: 'auto' }} />
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.2 }}>
              {currentCard.trait}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '2.5rem', fontSize: '9px', fontWeight: 900, color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <MousePointer2 style={{ width: '0.75rem', height: '0.75rem' }} />
               Use buttons below
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
        <button onClick={() => handleSwipe(false)} className="secondary-btn" style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
          <X style={{ width: '2rem', height: '2rem' }} />
        </button>
        <button onClick={() => handleSwipe(true)} className="secondary-btn" style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
          <Heart style={{ width: '2rem', height: '2rem' }} />
        </button>
      </div>
    </div>
  );
};

const ResultsList = ({ matches, onReset }) => {
  const resultsRef = useRef(null);

  useEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section ref={resultsRef} style={{ paddingBottom: '8rem' }}>
      <div className="layout-header">
        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '99px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#818cf8' }}>Match Generated</span>
        </div>
        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>Discovery Pulse Results</h2>
        <p style={{ fontSize: '1.1rem', color: '#71717a', maxWidth: '40rem', margin: '0 auto' }}>
          Our vector engine analyzed your traits across specialized career sectors. 
          Here are your resonance markers.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {matches.map((match, idx) => (
          <div key={idx} className="obsidian-card">
            <div style={{ display: 'flex', flexDirection: 'column', md: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  {match.job_title}
                </h3>
                <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#52525b' }}>
                  {match.industry || 'Market Wide'}
                </span>
              </div>
              
              <div className="score-box">
                <p style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: '#52525b', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Affinity</p>
                <p style={{ fontSize: '3rem', fontWeight: 900, color: '#6366f1', fontStyle: 'italic' }}>
                  {Math.round(match.match_percentage)}%
                </p>
              </div>
            </div>

            <p style={{ fontSize: '1.25rem', color: '#a1a1aa', lineHeight: 1.5, marginBottom: '2.5rem' }}>
              {match.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem', padding: '2rem', background: '#09090b', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  <Heart style={{ width: '1rem', height: '1rem' }} /> Resonance
                </div>
                <p style={{ fontSize: '0.9rem', color: '#71717a', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{match.reasoning}"
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  <Search style={{ width: '1rem', height: '1rem' }} /> Indicators
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {match.skills ? match.skills.split(',').map((s, i) => (
                    <span key={i} style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', padding: '0.4rem 0.6rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.03)', borderRadius: '6px', color: '#3f3f46' }}>{s.trim()}</span>
                  )) : 'General'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#52525b] mb-1">Potential</p>
                <p style={{ color: 'white', fontWeight: 800 }}>{match.salary_range || 'Competitive'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#52525b] mb-1">Baseline</p>
                <p style={{ color: 'white', fontWeight: 800 }}>{match.education || 'Self-Guided'}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Open Dossier <ChevronRight style={{ width: '0.8rem', height: '0.8rem' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <button onClick={onReset} className="pulse-btn secondary">
          <RefreshCw style={{ width: '1.25rem', height: '1.25rem' }} /> Reset Analysis
        </button>
      </div>
    </section>
  );
};

const PathfinderForm = ({ loading, onSubmit }) => {
  const [formData, setFormData] = useState({ interests: '', skills: '', values: '' });
  const [step, setStep] = useState(0);

  const sections = [
    { key: 'interests', label: 'What fuels your curiosity?' },
    { key: 'skills', label: 'What is your natural expertise?' },
    { key: 'values', label: 'What do you aim to achieve?' }
  ];

  const handleNext = () => {
    if (step < 2) setStep(prev => prev + 1);
    else onSubmit(formData);
  };

  return (
    <div className="obsidian-card">
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#52525b' }}>Pulse {step + 1} / 3</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 900, fontStyle: 'italic', opacity: 0.5 }}>{Math.round(((step+1)/3)*100)}%</p>
        </div>
        <div style={{ height: '2px', background: '#09090b', borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#6366f1', width: `${((step+1)/3)*100}%` }} />
        </div>
      </div>

      <div style={{ marginBottom: '4rem' }}>
        <label style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', color: '#e4e4e7' }}>{sections[step].label}</label>
        <textarea
          value={formData[sections[step].key]}
          onChange={(e) => setFormData(prev => ({ ...prev, [sections[step].key]: e.target.value }))}
          className="textframe"
          placeholder="Detailed input for neural matching..."
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <button onClick={() => step > 0 && setStep(s => s - 1)} className="secondary-btn" style={{ opacity: step === 0 ? 0 : 1 }}>Back</button>
        <button onClick={handleNext} className="pulse-btn">
          {step === 2 ? 'Initialize Match' : 'Continue Path'}
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [mode, setMode] = useState('discovery');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDiscovery = async (traits) => {
    setLoading(true);
    try {
      const response = await fetch('https://careersync-ai-guo8.onrender.com/api/match-careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: traits.join(', '), skills: 'Discovery Profile', values: 'Vector Harmony' })
      });
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '0 1.5rem' }}>
      <div className="obsidian-bg" />

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header className="layout-header">
          <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '2.5rem', background: 'rgba(24, 24, 27, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '2.5rem' }}>
            <Briefcase style={{ width: '2.5rem', height: '2.5rem', color: '#6366f1' }} />
          </div>
          
          <h1 className="title-pulse" style={{ marginBottom: '1.5rem' }}>CareerSync AI</h1>
          <p style={{ fontSize: '1.1rem', color: '#52525b', maxWidth: '35rem', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
            Navigate your professional resonance through vector-driven discovery.
          </p>

          {!matches.length && (
            <div className="mode-pill-stable">
              <button 
                onClick={() => setMode('discovery')}
                className={`mode-btn-stable ${mode === 'discovery' ? 'active' : ''}`}
              >
                Discovery
              </button>
              <button 
                onClick={() => setMode('form')}
                className={`mode-btn-stable ${mode === 'form' ? 'active' : ''}`}
              >
                Pathfinder
              </button>
            </div>
          )}
        </header>

        <main>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '5rem' }}>
               <RefreshCw style={{ width: '3rem', height: '3rem', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
               <p style={{ marginTop: '1.5rem', fontWeight: 800 }}>Neural Processing...</p>
             </div>
          ) : matches.length > 0 ? (
            <ResultsList matches={matches} onReset={() => setMatches([])} />
          ) : mode === 'discovery' ? (
            <DiscoverySwiper onDiscoveryComplete={handleDiscovery} />
          ) : (
            <PathfinderForm onSubmit={handleDiscovery} loading={loading} />
          )}
        </main>

        <footer style={{ marginTop: '10rem', padding: '4rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', color: '#27272a' }}>
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2rem' }}>Pulse Network v0.7.2</span>
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1rem', color: 'rgba(99, 102, 241, 0.4)' }}>Status: Harmonic</span>
        </footer>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
