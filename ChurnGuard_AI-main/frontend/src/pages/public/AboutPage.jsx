import { Link } from 'react-router-dom'
import { HelpCircle, AlertCircle, Target, Users, BookOpen, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="content-page">
      <div className="page-header">
        <span className="section-tag">Platform Context</span>
        <h1>About ChurnGuard AI</h1>
        <p className="lead-text">
          Understanding customer churn dynamics, platform goals, and the statistical principles behind predictive retention.
        </p>
      </div>

      <div className="page-body">
        <section className="content-block">
          <h2>1. What Does Customer Churn Mean?</h2>
          <p>
            Customer churn (also known as customer attrition, turnover, or defection) represents the percentage of customers who stop doing business with an entity or discontinue their subscription during a given timeframe.
          </p>
          <p>
            In subscription and contract-based business models (telecom, SaaS, digital media, utilities), acquiring a new customer is empirically estimated to cost 5 to 7 times more than retaining an existing one. High churn directly erodes customer lifetime value (LTV), compresses operating margins, and stresses acquisition funnels.
          </p>
        </section>

        <section className="content-block">
          <h2>2. Why Churn Prediction Matters</h2>
          <p>
            Reactive retention efforts—such as offering discounts after a customer has already submitted a cancellation request—suffer from low win-back rates. Predictive modeling enables retention teams to identify early behavioral warning signs:
          </p>
          <div className="grid-2">
            <div className="info-box">
              <h4>Tenure & Commitment Dynamics</h4>
              <p>Customers in their first 1–6 months on flexible month-to-month terms exhibit significantly higher churn vulnerability compared to customers on multi-year contracts.</p>
            </div>
            <div className="info-box">
              <h4>Support Friction Indicators</h4>
              <p>Spikes in customer service inquiries or unresolved technical tickets frequently precede account cancellations.</p>
            </div>
            <div className="info-box">
              <h4>Price Sensitivity</h4>
              <p>Customers with high monthly recurring bills relative to their product utilization represent high-risk profiles if competitors offer lower initial pricing.</p>
            </div>
            <div className="info-box">
              <h4>Targeted Interventions</h4>
              <p>Proactive customer success check-ins, onboarding support, and loyalty incentives can be targeted specifically at vulnerable cohorts.</p>
            </div>
          </div>
        </section>

        <section className="content-block">
          <h2>3. Project Objectives</h2>
          <ul>
            <li><strong>Methodological Rigor:</strong> Train models strictly on verified labeled customer datasets using standardized preprocessing pipelines without data leakage.</li>
            <li><strong>Full-Stack Transparency:</strong> Expose real evaluation metrics (ROC-AUC, Precision, Recall, Confusion Matrices) rather than fabricated claims.</li>
            <li><strong>Data Integrity:</strong> Prevent catastrophic feedback loops where models retrain on unverified predictions as ground-truth labels.</li>
            <li><strong>Continuous Monitoring:</strong> Detect input distribution drift to alert engineers when incoming customer patterns diverge from training baselines.</li>
          </ul>
        </section>

        <section className="content-block">
          <h2>4. Intended Users & Scope</h2>
          <p>
            ChurnGuard AI is designed for:
          </p>
          <ul>
            <li><strong>Data Scientists & ML Engineers:</strong> Comparing model architectures, validating dataset distributions, and tracking artifact versions.</li>
            <li><strong>Product & Operations Managers:</strong> Scoring customer cohorts, exploring churn distribution trends, and exporting predictions for campaign targeting.</li>
            <li><strong>Customer Success Teams:</strong> Evaluating individual accounts during quarterly reviews or support ticket escalation.</li>
          </ul>
        </section>

        <section className="content-block callout-block">
          <div className="callout-icon"><AlertCircle size={24} /></div>
          <div className="callout-body">
            <h3>Scope and Limitations</h3>
            <p>
              Machine-learning predictions are probabilistic estimates derived from statistical patterns in historical training data. A prediction of 85% churn risk does not guarantee cancellation, nor does a low score guarantee indefinite retention. Predictions should inform customer success interventions, not replace human judgment.
            </p>
          </div>
        </section>

        <div className="page-actions">
          <Link to="/features" className="btn btn-primary">
            Explore Features
            <ArrowRight size={16} />
          </Link>
          <Link to="/methodology" className="btn btn-secondary">
            Read ML Methodology
          </Link>
        </div>
      </div>
    </div>
  )
}
