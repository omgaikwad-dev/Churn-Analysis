import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicOnlyRoute from './components/common/PublicOnlyRoute'
import ScrollProgressBar from './components/common/ScrollProgressBar'
import BackToTop from './components/common/BackToTop'

// Public Pages
import HomePage from './pages/public/HomePage'
import AboutPage from './pages/public/AboutPage'
import FeaturesPage from './pages/public/FeaturesPage'
import MethodologyPage from './pages/public/MethodologyPage'
import FaqPage from './pages/public/FaqPage'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Dashboard Pages
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage'
import CustomersPage from './pages/dashboard/CustomersPage'
import PredictionsPage from './pages/dashboard/PredictionsPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import ModelsPage from './pages/dashboard/ModelsPage'
import DatasetsPage from './pages/dashboard/DatasetsPage'
import HistoryPage from './pages/dashboard/HistoryPage'
import SettingsPage from './pages/dashboard/SettingsPage'

import './App.css'

import BackgroundAnimation from './components/common/BackgroundAnimation'
import PageTransition from './components/common/PageTransition'

function PublicLayout({ children, showFooter = true }) {
  return (
    <div className="public-app-layout">
      <BackgroundAnimation />
      <ScrollProgressBar />
      <Navbar />
      <main className="public-main-content">
        <PageTransition>{children}</PageTransition>
      </main>
      {showFooter && <Footer />}
      <BackToTop />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <AboutPage />
                </PublicLayout>
              }
            />
            <Route
              path="/features"
              element={
                <PublicLayout>
                  <FeaturesPage />
                </PublicLayout>
              }
            />
            <Route
              path="/methodology"
              element={
                <PublicLayout>
                  <MethodologyPage />
                </PublicLayout>
              }
            />
            <Route
              path="/faq"
              element={
                <PublicLayout>
                  <FaqPage />
                </PublicLayout>
              }
            />

            {/* Auth Routes (Blocked for already authenticated users - No Footer) */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <PublicLayout showFooter={false}>
                    <LoginPage />
                  </PublicLayout>
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <PublicLayout showFooter={false}>
                    <RegisterPage />
                  </PublicLayout>
                </PublicOnlyRoute>
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardOverviewPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="predictions" element={<PredictionsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="models" element={<ModelsPage />} />
              <Route path="datasets" element={<DatasetsPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback wildcard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
