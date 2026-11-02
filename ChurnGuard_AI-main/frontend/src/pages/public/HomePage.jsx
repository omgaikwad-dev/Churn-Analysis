import { useState } from 'react'
import { Link } from 'react-router-dom'
import LiveSimulator from '../../components/common/LiveSimulator'
import ScrollReveal from '../../components/common/ScrollReveal'
import SlidingTicker from '../../components/common/SlidingTicker'
import {
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Database,
  BrainCircuit,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BarChart3,
  Layers,
  Cpu,
  Target,
  FileCheck,
  DollarSign,
  UserCheck,
} from 'lucide-react'

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0)

  const faqs = [
    {
      q: 'What does ChurnGuard AI predict and what is the probability score?',
      a: 'ChurnGuard AI produces a calibrated posterior probability (0.0% to 100.0%) indicating the likelihood that a customer will cancel their subscription within their renewal cycle. Probabilities are mapped into three operational risk bands: Low Risk (< 30%), Medium Risk (30% to 69.9%), and High Risk (≥ 70%).',
    },
    {
      q: 'Does the machine learning pipeline ever use predictions as training labels?',
      a: 'Strictly No. A core architectural principle of ChurnGuard AI is zero self-fulfilling label feedback loops. Retraining is exclusively permitted on verified ground-truth labels from labeled datasets, preventing model drift and catastrophic confidence collapse.',
    },
    {
      q: 'What dataset format is accepted for batch uploads and model training?',
      a: 'The platform ingests CSV files containing customer attributes. Our automatic schema engine maps industry-standard column names (e.g., IBM Telco standards like customerID, tenure, MonthlyCharges, Contract, TotalCharges, and Churn). Files are safely validated for missing values and duplicates prior to training or scoring.',
    },
    {
      q: 'Which machine learning algorithms are supported?',
      a: 'Users can train and evaluate multiple algorithms against their data: Logistic Regression (transparent, interpretable linear log-odds), Random Forest (ensemble of decision trees capturing non-linear interactions), and Gradient Boosting (sequential error minimization for maximum discrimination).',
    },
    {
      q: 'How does statistical feature drift detection work?',
      a: 'The monitoring subsystem continuously tracks incoming inference feature distributions (tenure, billing amounts, contract distributions) and calculates standardized z-score distances against the verified reference training baseline. If incoming customer traffic deviates significantly (> 3.0σ), automated drift alerts are generated.',
    },
    {
      q: 'How is data security and user ownership enforced?',
      a: 'Every record, uploaded dataset, customer profile, and model artifact is cryptographically and relationally bound to the authenticated user ID. Passwords are protected using memory-hard Argon2id hashing, and sessions use signed JWT tokens. Users can never view or modify another organization’s data.',
    },
  ]

  const scrollToSimulator = (e) => {
    e.preventDefault()
    const el = document.getElementById('simulator')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="home-page scrolling-landing">
      {/* 1. Hero Section */}
      <section className="hero-section" id="top">
        <div className="hero-container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Enterprise Customer Churn Intelligence & Prediction</span>
          </div>

          <h1 className="hero-title">
            Stop Customer Churn <br />
            <span className="text-gradient">Before It Costs You Revenue</span>
          </h1>

          <p className="hero-subtitle">
            ChurnGuard AI equips growth, product, and customer success teams with transparent, supervised machine-learning algorithms to detect high-risk accounts, isolate friction drivers, and protect recurring revenue.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <a href="#simulator" onClick={scrollToSimulator} className="btn btn-secondary btn-lg">
              <Sparkles size={18} />
              Try Live Simulator
            </a>
          </div>

          {/* Interactive Preview Mockup with ScrollReveal */}
          <ScrollReveal direction="up" delay={0.15}>
            <div className="hero-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="mockup-title">ChurnGuard Enterprise Dashboard — Active Machine Learning Engine</span>
              </div>
              <div className="mockup-content">
                <div className="mockup-stat-row">
                  <div className="mockup-stat">
                    <span className="stat-label">Active Model</span>
                    <span className="stat-val text-success">Random Forest (v2.0)</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-label">Evaluation ROC-AUC</span>
                    <span className="stat-val text-accent">0.843</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-label">Test Split Accuracy</span>
                    <span className="stat-val">76.4%</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="stat-label">Drift Status</span>
                    <span className="stat-val text-success">Healthy (No Drift)</span>
                  </div>
                </div>

                <div className="mockup-card-grid">
                  <div className="mockup-card">
                    <h4>Sample High-Risk Customer</h4>
                    <div className="mockup-meta">
                      <span className="risk-pill high">91.4% Churn Risk</span>
                      <span>Tenure: 2 mos</span>
                      <span>Contract: Month-to-Month</span>
                      <span>Monthly: $98.50</span>
                      <span>Calls: 4</span>
                    </div>
                    <div className="driver-bar">
                      <span className="driver-label">Primary Driver: Short Tenure & Month-to-Month Contract</span>
                      <div className="progress-track"><div className="progress-fill" style={{ width: '91%' }}></div></div>
                    </div>
                  </div>

                  <div className="mockup-card">
                    <h4>Sample Retained Customer</h4>
                    <div className="mockup-meta">
                      <span className="risk-pill low">4.8% Churn Risk</span>
                      <span>Tenure: 48 mos</span>
                      <span>Contract: Two Year</span>
                      <span>Monthly: $38.00</span>
                      <span>Calls: 0</span>
                    </div>
                    <div className="driver-bar">
                      <span className="driver-label">Primary Driver: Two-Year Contract Commitment</span>
                      <div className="progress-track"><div className="progress-fill fill-low" style={{ width: '5%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Infinite Sliding Ticker Marquee */}
      <SlidingTicker />

      {/* 2. Interactive Live Simulator Section */}
      <section className="section simulator-section" id="simulator">
        <div className="section-container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="section-header">
              <span className="section-tag">Hands-On Demonstration</span>
              <h2>Test the Machine Learning Engine Now</h2>
              <p>Drag the sliders below to simulate customer behaviors and watch the calibrated classification engine update probabilities in real time.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <LiveSimulator />
          </ScrollReveal>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="section features-section" id="features">
        <div className="section-container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="section-header">
              <span className="section-tag">Platform Capabilities</span>
              <h2>Comprehensive Retention Engineering</h2>
              <p>Everything your analytics and retention teams need to score, monitor, and prevent account loss.</p>
            </div>
          </ScrollReveal>

          <div className="grid-3">
            {[
              {
                icon: Target,
                iconClass: 'bg-blue',
                title: 'Real-Time Account Inference',
                desc: 'Score individual customer records with instant probability outputs, operational risk categories, and normalized feature importance rankings.',
              },
              {
                icon: FileSpreadsheet,
                iconClass: 'bg-cyan',
                title: 'Scalable CSV Batch Scoring',
                desc: 'Upload multi-row customer datasets. Parse, validate schemas, detect missing values, and execute batch predictions in a single automated pass.',
              },
              {
                icon: BrainCircuit,
                iconClass: 'bg-indigo',
                title: 'Multi-Model Registry',
                desc: 'Train and evaluate Logistic Regression, Random Forest, and Gradient Boosting algorithms on stratified test splits. Review ROC-AUC, F1, and Confusion Matrices.',
              },
              {
                icon: Activity,
                iconClass: 'bg-red',
                title: 'Statistical Feature Drift Monitoring',
                desc: 'Continuously inspect incoming inference distributions against verified training baselines to detect population shifts before accuracy degrades.',
              },
              {
                icon: BarChart3,
                iconClass: 'bg-blue',
                title: 'Cohort Analytics & Visual Trends',
                desc: 'Explore real-time Recharts visualizations showing risk distribution splits, churn rate trends, and customer contract segment breakdowns.',
              },
              {
                icon: Lock,
                iconClass: 'bg-cyan',
                title: 'Enterprise Security & Privacy',
                desc: 'Memory-hard Argon2id password encryption, signed JWT token sessions, and strict database-level owner isolation across all records.',
              },
            ].map((feat, idx) => {
              const IconComp = feat.icon
              return (
                <ScrollReveal key={feat.title} direction="up" delay={0.08 * (idx + 1)}>
                  <div className="feature-card interactive-hover-lift">
                    <div className={`feature-icon ${feat.iconClass}`}>
                      <IconComp size={24} />
                    </div>
                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. Methodology Workflow Section */}
      <section className="section methodology-section" id="methodology">
        <div className="section-container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="section-header">
              <span className="section-tag">Scientific Methodology</span>
              <h2>The ChurnGuard Machine Learning Lifecycle</h2>
              <p>A transparent, leak-proof pipeline engineered according to industry best practices in data science.</p>
            </div>
          </ScrollReveal>

          <div className="workflow-steps">
            {[
              {
                step: '01',
                title: 'Data Ingestion & Cleaning',
                desc: 'CSV files are validated for schema integrity, column types, missing values, and duplicate rows prior to pipeline ingestion.',
              },
              {
                step: '02',
                title: 'Leak-Free Preprocessing',
                desc: 'StandardScaler fits exclusively on the 80% training partition, preventing data leakage between training and evaluation splits.',
              },
              {
                step: '03',
                title: 'Stratified Evaluation',
                desc: 'Models are evaluated on an isolated 20% test split, calculating honest Accuracy, Precision, Recall, F1, and ROC-AUC metrics.',
              },
              {
                step: '04',
                title: 'Inference & Integrity Safeguards',
                desc: 'Probabilities are assigned to operational risk tiers. Retraining is strictly limited to verified ground-truth labels.',
              },
            ].map((step, idx) => (
              <ScrollReveal key={step.step} direction="up" delay={0.1 * (idx + 1)}>
                <div className="step-card interactive-hover-lift">
                  <div className="step-num">{step.step}</div>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. About / Economics of Retention Section */}
      <section className="section about-section" id="about">
        <div className="section-container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="section-header">
              <span className="section-tag">Business Economics</span>
              <h2>Why Customer Retention Outweighs Acquisition</h2>
              <p>Understand the economic impact of compounding customer lifetime value.</p>
            </div>
          </ScrollReveal>

          <div className="grid-2">
            <ScrollReveal direction="left" delay={0.15}>
              <div className="info-box interactive-hover-lift">
                <div className="feature-icon bg-indigo"><DollarSign size={24} /></div>
                <h4>5x to 7x Higher Acquisition Costs</h4>
                <p>
                  Acquiring a new customer costs between 5 and 7 times more than retaining an existing account. Preventing even a 5% churn rate can increase company profit by up to 25% to 95% over time.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.15}>
              <div className="info-box interactive-hover-lift">
                <div className="feature-icon bg-cyan"><UserCheck size={24} /></div>
                <h4>Net Revenue Retention (NRR) Growth</h4>
                <p>
                  Top-performing SaaS and subscription organizations maintain Net Retention above 115%. ChurnGuard identifies at-risk cohorts early enough for success managers to intervene proactively.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. Interactive FAQ Accordion Section */}
      <section className="section faq-section" id="faq">
        <div className="section-container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="section-header">
              <span className="section-tag">Frequently Asked Questions</span>
              <h2>Common Questions About ChurnGuard AI</h2>
              <p>Everything you need to know about the prediction platform, methodology, and security.</p>
            </div>
          </ScrollReveal>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <ScrollReveal key={index} direction="up" delay={0.06 * (index + 1)}>
                  <div className={`faq-card ${isOpen ? 'active-faq' : ''}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                        }}
                      />
                    </button>
                    {isOpen && (
                      <div className="faq-answer-body">
                        {faq.a}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action with Zoom Reveal */}
      <ScrollReveal direction="zoom" delay={0.1}>
        <section className="cta-section" id="cta">
          <div className="cta-container">
            <h2>Ready to Protect Recurring Revenue?</h2>
            <p>Create an account to upload your first customer dataset, run predictions, and monitor retention metrics today.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  )
}
