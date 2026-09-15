
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

declare global {
  interface Window {
    __ENV__?: {
      VITE_CLERK_PUBLISHABLE_KEY?: string;
    };
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  window.__ENV__?.VITE_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <App />
      </ClerkProvider>
    ) : (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <h2>Missing VITE_CLERK_PUBLISHABLE_KEY</h2>
        <p>
          Set VITE_CLERK_PUBLISHABLE_KEY in your environment and restart the app.
        </p>
      </div>
    )}
  </React.StrictMode>
);
