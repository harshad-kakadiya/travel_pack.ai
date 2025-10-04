import ItineraryViewer from './pages/ItineraryViewer';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from './components/Analytics';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CookieConsent } from './components/CookieConsent';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Plan } from './pages/Plan';
import { Examples } from './pages/Examples';
import { ExamplesCheckoutStep } from './pages/ExamplesCheckoutStep';
import { Preview } from './pages/Preview';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { Success } from './pages/Success';
import Cancel from './pages/Cancel';
import { Support } from './pages/Support';
import { Pricing } from './pages/Pricing';
import { Features } from './pages/Features';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { RefundPolicy } from './pages/RefundPolicy';
import { NotFound } from './pages/NotFound';
import { Admin } from './pages/Admin';
import { DemoEditor } from './pages/DemoEditor';
import PDFDemo from './components/PDFDemo';
import PDFTest from './pages/PDFTest';
import { TripProvider } from './context/TripContext';
import { AdminProvider } from './context/AdminContext';
import { AuthProvider } from './context/AuthContext';
import ResetPassword from './pages/ResetPassword';
import { EmailConfirmation } from './pages/EmailConfirmation';
import { ScrollToTop } from './components/ScrollToTop';


function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <TripProvider>
        <Router>
          <HelmetProvider>
            <ErrorBoundary>
              <ScrollToTop />
              <Analytics />
              <CookieConsent />
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/plan" element={<Plan />} />
                  <Route path="/examples" element={<Examples />} />
                  <Route path="/examples-checkout-step" element={<ExamplesCheckoutStep />} />
                  <Route path="/preview" element={<Preview />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/cancel" element={<Cancel />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/demo-editor" element={<DemoEditor />} />
                  <Route path="/pdf-demo" element={<PDFDemo />} />
                  <Route path="/pdf-test" element={<PDFTest />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/email-confirmation" element={<EmailConfirmation />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/itinerary/:id/day/:day" element={<ItineraryViewer />} />
</Routes>
              </Layout>
            </ErrorBoundary>
          </HelmetProvider>
        </Router>
        </TripProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
