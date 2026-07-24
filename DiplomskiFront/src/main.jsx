import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} locale="en">
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <App />
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                  },
                  success: {
                    iconTheme: {
                      primary: "var(--primary)",
                      secondary: "var(--popover)",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "var(--destructive)",
                      secondary: "var(--popover)",
                    },
                  },
                }}
              />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
