import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight } from 'lucide-react'

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      q: 'What is customer churn and how is it defined?',
      a: 'Customer churn refers to the rate at which subscription or contract customers cancel their service within a defined time frame. In ChurnGuard AI, churn is modeled as a binary classification problem: 0 indicates the customer remained active, and 1 indicates the customer cancelled.',
    },
    {
      q: 'What columns and formats must my uploaded dataset have?',
      a: 'Datasets must be standard CSV (.csv) files. For supervised model training, the file should include customer attributes (such as tenure, monthly charges, contract type, or support calls) and a binary target column named "Churn", "Target", or "Churned" containing Yes/No or 1/0 values. For batch prediction scoring without training, the target column is optional.',
    },
    {
      q: 'Which machine-learning algorithms are available for training?',
      a: 'ChurnGuard AI supports three production algorithms: (1) L2-penalized Logistic Regression for linear interpretability; (2) Random Forest Classifier for capturing nonlinear interactions; and (3) Gradient Boosting Classifier for gradient-boosted decision trees. All models are trained with a standardized preprocessing pipeline.',
    },
    {
      q: 'How are risk categories defined?',
      a: 'The platform categorizes churn probability into three operational tiers: Low Risk (probability < 30%), Medium Risk (30% to 70%), and High Risk (probability ≥ 70%). These thresholds are documented operational conventions that enable customer success teams to prioritize outreach.',
    },
    {
      q: 'Why does ChurnGuard AI strictly forbid retraining on its own predictions?',
      a: 'Retraining a machine-learning model on its own predicted labels without verified historical ground-truth creates a dangerous feedback loop known as confirmation bias or model collapse. Over time, arbitrary prediction thresholds cause the model to shift its intercept, eventually classifying almost every customer as high risk.',
    },
    {
      q: 'How does data drift detection work?',
      a: 'ChurnGuard AI compares the feature distributions of recent live inference requests against the baseline training distribution. If incoming customer features deviate by more than 3.0 standard deviations (z-score), a data drift warning is flagged on the monitoring console, prompting the team to evaluate if customer demographics have changed.',
    },
    {
      q: 'What are the upload file size restrictions?',
      a: 'Uploaded CSV files are limited to 25MB per upload. Files are validated on the backend to prevent path traversal, SQL injection, and malformed CSV syntax. Executable files, scripts, or foreign pickled models are strictly rejected.',
    },
    {
      q: 'How is user authentication and data privacy secured?',
      a: 'User passwords are encrypted using state-of-the-art Argon2id hashing. Authenticated sessions use signed JWT tokens with HttpOnly cookies. Every protected endpoint enforces strict server-side ownership checks so users can only access their own datasets, customers, and models.',
    },
  ]

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <span className="section-tag">Common Inquiries</span>
        <h1>Frequently Asked Questions</h1>
        <p className="lead-text">
          Everything you need to know about datasets, algorithms, security, and churn prediction methodology.
        </p>
      </div>

      <div className="page-body">
        <div className="faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div key={faq.q} className={`faq-card ${isOpen ? 'open' : ''}`}>
                <button className="faq-question-btn" onClick={() => toggle(idx)}>
                  <span className="faq-question-text">{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && <div className="faq-answer-body"><p>{faq.a}</p></div>}
              </div>
            )
          })}
        </div>

        <div className="faq-contact-card">
          <HelpCircle size={32} className="text-accent" />
          <div className="faq-contact-info">
            <h3>Have additional questions?</h3>
            <p>Explore the ML methodology documentation or register an account to test sample predictions.</p>
          </div>
          <Link to="/register" className="btn btn-primary">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
