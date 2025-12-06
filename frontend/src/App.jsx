import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Briefcase, Sparkles, AlertCircle, CheckCircle, TrendingUp, Book, DollarSign } from 'lucide-react';

const QUESTIONS_CONFIG = [
  {
    section: 'Interests',
    icon: Sparkles,
    color: '#3b82f6',
    questions: [
      { key: 'interests', label: 'What topics or activities genuinely interest you?', required: true },
      { key: 'interests_fulltime', label: 'Could you see yourself working full-time in this area?' },
      { key: 'interests_appeal', label: 'What specifically appeals to you about these interests?' }
    ]
  },
  {
    section: 'Skills',
    icon: TrendingUp,
    color: '#10b981',
    questions: [
      { key: 'skills', label: 'What are you naturally good at?', required: true },
      { key: 'skills_natural', label: 'What skills come most naturally to you?' },
      { key: 'skills_energized', label: 'What activities leave you feeling energized?' }
    ]
  },
  {
    section: 'Problem Solving',
    icon: CheckCircle,
    color: '#475569',
    questions: [
      { key: 'problem_solving', label: 'What types of problems do you enjoy solving?' },
      { key: 'problem_method', label: 'How do you typically approach problem-solving?' },
      { key: 'problem_enjoy', label: 'What about problem-solving is most satisfying?' }
    ]
  },
  {
    section: 'Work Style',
    icon: Briefcase,
    color: '#f97316',
    questions: [
      { key: 'work_style', label: 'Do you prefer working alone, in teams, or a mix?' },
      { key: 'work_routine', label: 'Structured routines or flexible schedules?' },
      { key: 'work_goals', label: 'What does success look like to you in a career?' }
    ]
  },
  {
    section: 'Values',
    icon: Book,
    color: '#6366f1',
    questions: [
      { key: 'values', label: 'What matters most to you in a career?', required: true },
      { key: 'values_why', label: 'Why are these values important to you?' },
      { key: 'values_choice', label: 'How do these values influence your career choices?' }
    ]
  },
  {
    section: 'Inspiration',
    icon: Sparkles,
    color: '#ec4899',
    questions: [
      { key: 'career_inspiration', label: 'What careers or professionals inspire you?' },
      { key: 'inspiration_standout', label: 'What makes them stand out to you?' },
      { key: 'inspiration_pursue', label: 'Would you want to pursue a similar path?' }
    ]
  },
  {
    section: 'Environment',
    icon: TrendingUp,
    color: '#14b8a6',
    questions: [
      { key: 'environment_preference', label: 'What work environment do you thrive in?' },
      { key: 'environment_why', label: 'Why does this environment work best for you?' },
      { key: 'focus_preference', label: 'Do you prefer variety or deep focus?' }
    ]
  },
  {
    section: 'Impact',
    icon: DollarSign,
    color: '#64748b',
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1f2937 100%)',
      padding: '48px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <Briefcase style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '16px',
            letterSpacing: '-0.025em'
          }}>
            Career Path Finder
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.8)',
            maxWidth: '672px',
            margin: '0 auto'
          }}>
            Discover careers that align with your passions, skills, and values
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '48px',
          marginBottom: '32px'
        }}>
          {/* Progress Bar */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Step {currentStep + 1} of {QUESTIONS_CONFIG.length}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#3b82f6'
              }}>
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: '#f3f4f6',
              borderRadius: '999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                borderRadius: '999px',
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          </div>

          {/* Section Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: currentSection.color,
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <SectionIcon style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#111827'
            }}>
              {currentSection.section}
            </h2>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {currentSection.questions.map((q) => (
              <div key={q.key}>
                <label style={{ display: 'block', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    {q.label}
                    {q.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                  </span>
                </label>
                <textarea
                  value={formData[q.key]}
                  onChange={(e) => handleChange(q.key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: validationErrors[q.key] ? '2px solid #f87171' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: '#1f2937',
                    background: validationErrors[q.key] ? '#fef2f2' : 'white',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '100px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    if (!validationErrors[q.key]) {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!validationErrors[q.key]) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="Share your thoughts in detail..."
                  aria-label={q.label}
                  aria-required={q.required}
                  aria-invalid={!!validationErrors[q.key]}
                />
                {validationErrors[q.key] && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    color: '#dc2626',
                    fontSize: '14px'
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    <span>{validationErrors[q.key]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '2px solid #f3f4f6'
          }}>
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              style={{
                padding: '12px 32px',
                border: '2px solid #d1d5db',
                borderRadius: '12px',
                background: 'white',
                color: '#374151',
                fontSize: '15px',
                fontWeight: '600',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                opacity: currentStep === 0 ? 0.4 : 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (currentStep !== 0) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Previous
            </button>

            {currentStep === QUESTIONS_CONFIG.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '16px 40px',
                  border: 'none',
                  borderRadius: '12px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.4)';
                }}
              >
                {loading && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                )}
                {loading ? 'Analyzing...' : 'Find My Careers'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                style={{
                  padding: '12px 32px',
                  border: 'none',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                Next Step
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '2px solid #fca5a5',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <AlertCircle style={{
                width: '24px',
                height: '24px',
                color: '#dc2626',
                flexShrink: 0,
                marginTop: '2px'
              }} />
              <div>
                <h3 style={{
                  fontWeight: '600',
                  color: '#7f1d1d',
                  marginBottom: '4px'
                }}>
                  Connection Error
                </h3>
                <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {matches.length > 0 && (
          <div ref={resultsRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '12px'
              }}>
                Your Top Career Matches
              </h2>
              <p style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Based on your unique profile, here are {matches.length} careers tailored for you
              </p>
            </div>

            {matches.map((match, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  padding: '32px',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>
                    {match.job_title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    color: 'white',
                    borderRadius: '999px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                  }}>
                    {match.match_percentage.toFixed(1)}% Match
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: '#4b5563',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  {match.description}
                </p>

                {/* Reasoning */}
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid #bfdbfe'
                }}>
                  <h4 style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '12px'
                  }}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    Why This Matches You
                  </h4>
                  <p style={{
                    color: '#374151',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {match.reasoning}
                  </p>
                </div>

                {/* Skills */}
                {match.skills && (
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '12px'
                    }}>
                      <TrendingUp style={{ width: '20px', height: '20px', color: '#06b6d4' }} />
                      Required Skills
                    </h4>
                    <p style={{
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {match.skills}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                {(match.salary_range || match.education || match.industry) && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    paddingTop: '24px',
                    borderTop: '2px solid #f3f4f6'
                  }}>
                    {match.salary_range && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <DollarSign style={{ width: '20px', height: '20px', color: '#10b981' }} />
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                          }}>
                            Salary
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#111827',
                            fontWeight: '600'
                          }}>
                            {match.salary_range}
                          </div>
                        </div>
                      </div>
                    )}
                    {match.education && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Book style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                          }}>
                            Education
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#111827',
                            fontWeight: '600'
                          }}>
                            {match.education}
                          </div>
                        </div>
                      </div>
                    )}
                    {match.industry && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Briefcase style={{ width: '20px', height: '20px', color: '#64748b' }} />
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                          }}>
                            Industry
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#111827',
                            fontWeight: '600'
                          }}>
                            {match.industry}
                          </div>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CareerPathFinder;
