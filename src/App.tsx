/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "@/src/pages/Landing";
import Auth from "@/src/pages/Auth";
import Dashboard from "@/src/pages/Dashboard";
import NotFound from "@/src/pages/NotFound";
import Terms from "@/src/pages/Terms";
import { AuthProvider } from "@/src/hooks/useAuth";
import { ThemeProvider } from "@/src/hooks/useTheme";
import { CookieConsent } from "@/src/components/CookieConsent";
import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        <Router>
          <CookieConsent />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


