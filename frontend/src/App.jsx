import React, { useState } from 'react';

const App = () => {
  const [formData, setFormData] = useState({
    interests: '',
    interests_fulltime: '',
    interests_appeal: '',
    skills: '',
    skills_natural: '',
    skills_energized: '',
    problem_solving: '',
    problem_method: '',
    problem_enjoy: '',
    work_style: '',
    work_routine: '',
    work_goals: '',
    values: '',
    values_why: '',
    values_choice: '',
    career_inspiration: '',
    inspiration_standout: '',
    inspiration_pursue: '',
    environment_preference: '',
    environment_why: '',
    focus_preference: '',
    impact_preference: '',
    impact_why: ''
  });

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  const questions = [
    {
      section: 'Interests',
      questions: [
        { key: 'interests', label: 'What topics or activities genuinely interest you?' },
        { key: 'interests_fulltime', label: 'Could you see yourself working full-time in this area?' },
        { key: 'interests_appeal', label: 'What specifically appeals to you about these interests?' }
      ]
    },
    {
      section: 'Skills',
      questions: [
        { key: 'skills', label: 'What are you naturally good at?' },
        { key: 'skills_natural', label: 'What skills come most naturally to you?' },
        { key: 'skills_energized', label: 'What activities leave you feeling energized rather than drained?' }
      ]
    },
    {
      section: 'Problem Solving',
      questions: [
        { key: 'problem_solving', label: 'What types of problems do you enjoy solving?' },
        { key: 'problem_method', label: 'How do you typically approach problem-solving?' },
        { key: 'problem_enjoy', label: 'What about problem-solving do you find most satisfying?' }
      ]
    },
    {
      section: 'Work Style',
      questions: [
        { key: 'work_style', label: 'Do you prefer working alone, in teams, or a mix of both?' },
        { key: 'work_routine', label: 'Do you prefer structured routines or flexible schedules?' },
        { key: 'work_goals', label: 'What does success look like to you in a career?' }
      ]
    },
    {
      section: 'Values',
      questions: [
        { key: 'values', label: 'What matters most to you in a career?' },
        { key: 'values_why', label: 'Why are these values important to you?' },
        { key: 'values_choice', label: 'How do these values influence your career choices?' }
      ]
    },
    {
      section: 'Inspiration',
      questions: [
        { key: 'career_inspiration', label: 'What careers or professionals inspire you?' },
        { key: 'inspiration_standout', label: 'What makes them stand out to you?' },
        { key: 'inspiration_pursue', label: 'Would you want to pursue a similar path?' }
      ]
    },
    {
      section: 'Environment',
      questions: [
        { key: 'environment_preference', label: 'What work environment do you thrive in?' },
        { key: 'environment_why', label: 'Why does this environment work best for you?' },
        { key: 'focus_preference', label: 'Do you prefer variety or deep focus in your work?' }
      ]
    },
    {
      section: 'Impact',
      questions: [
        { key: 'impact_preference', label: 'What kind of impact do you want to make?' },
        { key: 'impact_why', label: 'Why is this impact important to you?' }
      ]
    }
  ];

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMatches([]);

    try {
      // FIXED: Use localhost instead of 0.0.0.0
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
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Make sure backend is running on port 8000.');
      console.error('Career matching error:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentSection = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '10px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
          }}>
            Career Path Finder
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
            Discover careers that match your interests and skills
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '40px',
          marginBottom: '30px'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#4a5568' }}>
                Step {currentStep + 1} of {questions.length}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#667eea' }}>
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.3s ease',
                borderRadius: '999px'
              }} />
            </div>
          </div>

          <div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '30px'
            }}>
              {currentSection.section}
            </h2>

            <div>
              {currentSection.questions.map(q => (
                <div key={q.key} style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    {q.label}
                  </label>
                  <textarea
                    value={formData[q.key]}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '100px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    placeholder="Share your thoughts..."
                  />
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '40px'
            }}>
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                style={{
                  padding: '12px 28px',
                  border: '2px solid #cbd5e0',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#4a5568',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 0 ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (currentStep !== 0) e.currentTarget.style.background = '#f7fafc';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                Previous
              </button>

              {currentStep === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    padding: '12px 32px',
                    border: 'none',
                    borderRadius: '8px',
                    background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {loading ? 'Finding Matches...' : 'Find My Careers'}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  style={{
                    padding: '12px 28px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fff5f5',
            border: '2px solid #fc8181',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '30px'
          }}>
            <p style={{ color: '#c53030', margin: 0, fontSize: '15px' }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div id="results">
            <h2 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}>
              Your Top Career Matches
            </h2>
            {matches.map((match, idx) => (
              <div key={idx} style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                padding: '30px',
                marginBottom: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#2d3748',
                    margin: 0
                  }}>
                    {match.job_title}
                  </h3>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {match.match_percentage.toFixed(1)}% Match
                  </div>
                </div>

                <p style={{
                  color: '#4a5568',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '20px'
                }}>
                  {match.description}
                </p>

                <div style={{
                  background: '#f7fafc',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '15px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '10px'
                  }}>
                    Why this matches you:
                  </h4>
                  <p style={{
                    color: '#4a5568',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {match.reasoning}
                  </p>
                </div>

                {match.skills && (
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '8px'
                    }}>
                      Required Skills:
                    </h4>
                    <p style={{
                      color: '#718096',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {match.skills}
                    </p>
                  </div>
                )}

                {(match.salary_range || match.education || match.industry) && (
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '15px',
                    marginTop: '15px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    {match.salary_range && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>
                          Salary Range
                        </span>
                        <span style={{ fontSize: '14px', color: '#2d3748', fontWeight: '500' }}>
                          {match.salary_range}
                        </span>
                      </div>
                    )}
                    {match.education && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>
                          Education
                        </span>
                        <span style={{ fontSize: '14px', color: '#2d3748', fontWeight: '500' }}>
                          {match.education}
                        </span>
                      </div>
                    )}
                    {match.industry && (
                      <div>
                        <span style={{ fontSize: '12px', color: '#718096', display: 'block', marginBottom: '4px' }}>
                          Industry
                        </span>
                        <span style={{ fontSize: '14px', color: '#2d3748', fontWeight: '500' }}>
                          {match.industry}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
