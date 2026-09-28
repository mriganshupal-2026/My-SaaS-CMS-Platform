import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, ChevronDown } from 'lucide-react';
import type { CookiePreferences } from '../../types';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    marketing: true,
    personalization: true,
    analytics: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem('viral_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('viral_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem('viral_cookie_consent', 'refused');
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('viral_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="cookie-consent-banner"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-[calc(100vw-32px)] sm:w-[380px] bg-white text-[#0A0A0A] rounded-2xl shadow-2xl p-5 border border-black/5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-sm leading-snug">
              Do you agree to optional cookies?
            </h3>
            <button
              type="button"
              onClick={handleRefuse}
              aria-label="Close banner"
              className="text-black/40 hover:text-black p-1 -mr-1 -mt-1 rounded-full cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <p className="text-xs text-[#0A0A0A]/70 leading-relaxed mb-4">
            We use cookies on our website. By clicking "Accept", you consent to their use. See our{' '}
            <a href="#privacy" className="underline text-[#df0567] hover:text-[#c4045a]">
              privacy policy
            </a>
            .
          </p>

          {/* Collapsible Preferences */}
          {showPreferences && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-black/10 pt-3 pb-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-black/80 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#df0567]" />
                  Necessary
                </span>
                <span className="text-[11px] text-black/50 font-medium">Always active</span>
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-black/70">Marketing</span>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  className="accent-[#df0567] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-black/70">Analytics</span>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="accent-[#df0567] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-black/70">Personalization</span>
                <input
                  type="checkbox"
                  checked={preferences.personalization}
                  onChange={(e) =>
                    setPreferences({ ...preferences, personalization: e.target.checked })
                  }
                  className="accent-[#df0567] rounded cursor-pointer"
                />
              </label>
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer text-center"
              >
                Accept
              </button>

              <button
                type="button"
                onClick={handleRefuse}
                className="flex-1 py-2 px-3 border border-black/20 hover:border-black/40 text-[#0A0A0A] text-xs font-medium rounded-full transition-colors cursor-pointer text-center"
              >
                Refuse
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showPreferences) {
                  handleSavePreferences();
                } else {
                  setShowPreferences(true);
                }
              }}
              className="w-full py-1.5 text-xs text-black/60 hover:text-black font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{showPreferences ? 'Save settings' : 'Settings'}</span>
              {!showPreferences && <ChevronDown size={13} />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
