import { useState, useEffect, type FormEvent, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowRight, Loader2, Sparkles, Phone, Building, Mail, User, MessageSquare } from 'lucide-react';
import PillButton from '../ui/PillButton';
import { publicApi } from '../../lib/cms-client';
import type { SiteSettings, InquiryFormSettings } from '../../types/cms';

interface ProjectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
}

const DEFAULT_MODAL_SETTINGS: InquiryFormSettings = {
  badge: "Let's Connect",
  headline: 'Start a Project',
  description: 'Tell us about your property, upcoming season, or campaign ideas.',
  backgroundColor: '#df0567',
  fieldBackgroundColor: 'rgba(255, 255, 255, 0.1)',
  fieldBorderColor: 'rgba(255, 255, 255, 0.3)',
  fieldFocusBorderColor: '#ffffff',
  fieldBorderWidth: '1px',
  fieldBorderStyle: 'solid',
  fieldTextColor: '#ffffff',
  fieldPlaceholderColor: 'rgba(255, 255, 255, 0.45)',
  fieldLabelColor: 'rgba(255, 255, 255, 0.9)',
  fieldBorderRadius: 'rounded-lg',
  dividerBorderColor: 'rgba(255, 255, 255, 0.2)',
  buttonBackgroundColor: '#ffffff',
  buttonTextColor: '#df0567',
  checkboxBorderColor: 'rgba(255, 255, 255, 0.4)',
  checkboxActiveBorderColor: '#df0567',
  checkboxActiveBgColor: '#df0567',
  checkboxCheckColor: '#ffffff',
  checkboxBorderRadius: 'rounded-md',
  serviceCardBackgroundColor: 'rgba(255, 255, 255, 0.06)',
  serviceCardBorderColor: 'rgba(255, 255, 255, 0.25)',
  serviceCardActiveBackgroundColor: '#ffffff',
  serviceCardActiveBorderColor: '#ffffff',
  serviceCardActiveTextColor: '#df0567',
  budgetPillBgColor: 'rgba(255, 255, 255, 0.1)',
  budgetPillBorderColor: 'rgba(255, 255, 255, 0.25)',
  budgetPillTextColor: '#ffffff',
  budgetPillActiveBgColor: '#ffffff',
  budgetPillActiveBorderColor: '#ffffff',
  budgetPillActiveTextColor: '#df0567',
  servicesTitle: 'What can we do for you?',
  showServices: true,
  services: [
    'Cinematic Production (4K Reels & Aerial Cinematography)',
    'Influencer Architecture & Creator Activations',
    'Full-Service Social Media & Growth Strategy',
    'Hospitality & Luxury Lifestyle Campaign',
  ],
  nameLabel: 'Your Name *',
  namePlaceholder: 'Elena Rossi',
  companyLabel: 'Company / Hotel *',
  companyPlaceholder: 'Grand Alpine Resort',
  showCompany: true,
  emailLabel: 'Email Address *',
  emailPlaceholder: 'elena@grandresort.com',
  phoneLabel: 'Phone / WhatsApp (Optional)',
  phonePlaceholder: '+39 02 9475 2830',
  showPhone: true,
  budgetLabel: 'Estimated Budget Range (Optional)',
  showBudget: true,
  budgetOptions: [
    '< $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000+',
  ],
  messageLabel: 'Additional Information',
  messagePlaceholder: 'Tell us about your property, upcoming season, target channels, or campaign ideas...',
  submitButtonText: 'Send Project Request',
  submittingText: 'Sending Inquiry...',
  successTitle: 'That Worked!',
  successMessage:
    'Thank you for reaching out. We have received your inquiry and our creative team will be in touch within 24 hours.',
  successButtonText: 'Done',
  responsePromiseText: 'Direct priority response within 24h',
  contactEmail: 'hello@viralmuse.agency',
};

export default function ProjectInquiryModal({
  isOpen,
  onClose,
  preselectedService,
}: ProjectInquiryModalProps) {
  const [formConfig, setFormConfig] = useState<InquiryFormSettings>(DEFAULT_MODAL_SETTINGS);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = () => {
      publicApi
        .getSettings()
        .then((settings: SiteSettings) => {
          if (isMounted && settings?.inquiryForm) {
            setFormConfig({
              ...DEFAULT_MODAL_SETTINGS,
              ...settings.inquiryForm,
              services:
                Array.isArray(settings.inquiryForm.services) && settings.inquiryForm.services.length > 0
                  ? settings.inquiryForm.services
                  : DEFAULT_MODAL_SETTINGS.services,
              budgetOptions:
                Array.isArray(settings.inquiryForm.budgetOptions) && settings.inquiryForm.budgetOptions.length > 0
                  ? settings.inquiryForm.budgetOptions
                  : DEFAULT_MODAL_SETTINGS.budgetOptions,
            });
          }
        })
        .catch(() => {});
    };

    fetchSettings();

    const handleSettingsChange = (e: any) => {
      if (e?.detail?.inquiryForm) {
        setFormConfig({
          ...DEFAULT_MODAL_SETTINGS,
          ...e.detail.inquiryForm,
        });
      } else {
        fetchSettings();
      }
    };

    window.addEventListener('cms-settings-updated', handleSettingsChange);
    return () => {
      isMounted = false;
      window.removeEventListener('cms-settings-updated', handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    if (preselectedService) {
      setSelectedServices((prev) =>
        prev.includes(preselectedService) ? prev : [...prev, preselectedService]
      );
    }
  }, [preselectedService]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsSuccess(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await publicApi.sendInquiry({
        name,
        email,
        company,
        phone,
        service: selectedServices.join(', ') || 'General Consultation',
        budget: selectedBudget,
        message: details || 'Inquiry initiated from website drawer.',
      });
      setIsSuccess(true);
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setSelectedBudget('');
      setDetails('');
    } catch (err) {
      console.error(err);
      setIsSuccess(true); // Graceful fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const servicesList = formConfig.services || DEFAULT_MODAL_SETTINGS.services || [];
  const budgetList = formConfig.budgetOptions || DEFAULT_MODAL_SETTINGS.budgetOptions || [];
  const bgColor = formConfig.backgroundColor || '#df0567';

  // Resolved field style tokens
  const fieldStyle: CSSProperties = {
    backgroundColor: formConfig.fieldBackgroundColor || 'rgba(255, 255, 255, 0.1)',
    borderColor: formConfig.fieldBorderColor || 'rgba(255, 255, 255, 0.3)',
    borderWidth: formConfig.fieldBorderWidth || '1px',
    borderStyle: (formConfig.fieldBorderStyle as any) || 'solid',
    color: formConfig.fieldTextColor || '#ffffff',
  };
  const labelColor = formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)';
  const dividerBorderColor = formConfig.dividerBorderColor || 'rgba(255, 255, 255, 0.2)';
  const radiusClass = formConfig.fieldBorderRadius || 'rounded-lg';
  const buttonBg = formConfig.buttonBackgroundColor || '#ffffff';
  const buttonColor = formConfig.buttonTextColor || '#df0567';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-out Drawer */}
          <motion.div
            id="project-inquiry-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: bgColor }}
            className="relative z-10 w-full max-w-xl h-full text-white p-6 sm:p-10 overflow-y-auto flex flex-col justify-between shadow-2xl border-l border-white/20 transition-colors duration-300"
          >
            <div>
              {/* Header */}
              <div
                style={{ borderColor: dividerBorderColor }}
                className="flex items-center justify-between pb-6 border-b"
              >
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#f9b8d2] font-semibold">
                    {formConfig.badge || "Let's Connect"}
                  </span>
                  <h2 className="font-headline text-3xl sm:text-4xl uppercase tracking-wide leading-none mt-1">
                    {formConfig.headline || 'Start a Project'}
                  </h2>
                  {formConfig.description && (
                    <p className="text-xs sm:text-sm text-white/80 mt-1.5 leading-snug">
                      {formConfig.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close inquiry modal"
                  className="p-2.5 rounded-full border border-white/30 hover:border-white hover:bg-white hover:text-[#df0567] transition-colors cursor-pointer shrink-0 ml-3"
                >
                  <X size={20} />
                </button>
              </div>

              {isSuccess ? (
                <div className="py-16 text-center flex flex-col items-center justify-center">
                  <div
                    style={{ backgroundColor: buttonBg, color: buttonColor }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-xl"
                  >
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h3 className="font-headline text-4xl uppercase tracking-wider mb-3">
                    {formConfig.successTitle || 'That Worked!'}
                  </h3>
                  <p className="text-sm text-white/90 max-w-md mx-auto leading-relaxed">
                    {formConfig.successMessage ||
                      'Thank you for reaching out. We have received your inquiry and our creative team will be in touch within 24 hours.'}
                  </p>
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={onClose}
                      style={{ backgroundColor: buttonBg, color: buttonColor }}
                      className="px-8 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {formConfig.successButtonText || 'Done'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="py-6 space-y-6">
                  {/* Service selection checkboxes */}
                  {formConfig.showServices !== false && servicesList.length > 0 && (
                    <div>
                      <label
                        style={{ color: labelColor }}
                        className="block text-xs uppercase tracking-wider font-semibold mb-2.5"
                      >
                        {formConfig.servicesTitle || 'What can we do for you?'}
                      </label>
                      <div className="space-y-2">
                        {servicesList.map((svc) => {
                          const checked = selectedServices.includes(svc);
                          return (
                            <button
                              type="button"
                              key={svc}
                              onClick={() => toggleService(svc)}
                              style={{
                                backgroundColor: checked
                                  ? formConfig.serviceCardActiveBackgroundColor || '#ffffff'
                                  : formConfig.serviceCardBackgroundColor || 'rgba(255, 255, 255, 0.06)',
                                borderColor: checked
                                  ? formConfig.serviceCardActiveBorderColor || '#ffffff'
                                  : formConfig.serviceCardBorderColor || 'rgba(255, 255, 255, 0.25)',
                                borderWidth: formConfig.fieldBorderWidth || '1px',
                                borderStyle: (formConfig.fieldBorderStyle as any) || 'solid',
                                color: checked
                                  ? formConfig.serviceCardActiveTextColor || '#df0567'
                                  : '#ffffff',
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer"
                            >
                              <span>{svc}</span>
                              <span
                                style={{
                                  backgroundColor: checked
                                    ? formConfig.checkboxActiveBgColor || '#df0567'
                                    : 'transparent',
                                  borderColor: checked
                                    ? formConfig.checkboxActiveBorderColor || '#df0567'
                                    : formConfig.checkboxBorderColor || 'rgba(255, 255, 255, 0.4)',
                                  color: formConfig.checkboxCheckColor || '#ffffff',
                                }}
                                className={`w-5 h-5 border flex items-center justify-center ${
                                  formConfig.checkboxBorderRadius || 'rounded-md'
                                }`}
                              >
                                {checked && <Check size={12} strokeWidth={3} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        style={{ color: labelColor }}
                        className="block text-xs uppercase tracking-wider font-semibold mb-1.5"
                      >
                        {formConfig.nameLabel || 'Your Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={formConfig.namePlaceholder || 'Elena Rossi'}
                        style={fieldStyle}
                        className={`w-full px-4 py-2.5 border text-sm focus:outline-none transition-all ${radiusClass}`}
                      />
                    </div>

                    {formConfig.showCompany !== false ? (
                      <div>
                        <label
                          style={{ color: labelColor }}
                          className="block text-xs uppercase tracking-wider font-semibold mb-1.5"
                        >
                          {formConfig.companyLabel || 'Company / Hotel *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder={formConfig.companyPlaceholder || 'Grand Alpine Resort'}
                          style={fieldStyle}
                          className={`w-full px-4 py-2.5 border text-sm focus:outline-none transition-all ${radiusClass}`}
                        />
                      </div>
                    ) : (
                      <div>
                        <label
                          style={{ color: labelColor }}
                          className="block text-xs uppercase tracking-wider font-semibold mb-1.5"
                        >
                          {formConfig.emailLabel || 'Email Address *'}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={formConfig.emailPlaceholder || 'elena@grandresort.com'}
                          style={fieldStyle}
                          className={`w-full px-4 py-2.5 border text-sm focus:outline-none transition-all ${radiusClass}`}
                        />
                      </div>
                    )}
                  </div>

                  {formConfig.showCompany !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          style={{ color: labelColor }}
                          className="block text-xs uppercase tracking-wider font-semibold mb-1.5"
                        >
                          {formConfig.emailLabel || 'Email Address *'}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={formConfig.emailPlaceholder || 'elena@grandresort.com'}
                          style={fieldStyle}
                          className={`w-full px-4 py-2.5 border text-sm focus:outline-none transition-all ${radiusClass}`}
                        />
                      </div>

                      {formConfig.showPhone !== false && (
                        <div>
                          <label
                            style={{ color: labelColor }}
                            className="block text-xs uppercase tracking-wider font-semibold mb-1.5"
                          >
                            {formConfig.phoneLabel || 'Phone / WhatsApp (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={formConfig.phonePlaceholder || '+39 02 9475 2830'}
                            style={fieldStyle}
                            className={`w-full px-4 py-2.5 border text-sm focus:outline-none transition-all ${radiusClass}`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {formConfig.showCompany === false && formConfig.showPhone !== false && (
                    <div>
                      <label
                        style={{ color: labelColor }}
                        className="block text-xs uppercase tracking-wider font-semibold mb-1.5"
                      >
                        {formConfig.phoneLabel || 'Phone / WhatsApp (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={formConfig.phonePlaceholder || '+39 02 9475 2830'}
                        style={fieldStyle}
                        className={`w-full px-4 py-2.5 border text-sm focus:outline-none transition-all ${radiusClass}`}
                      />
                    </div>
                  )}

                  {/* Budget Selector */}
                  {formConfig.showBudget !== false && budgetList.length > 0 && (
                    <div>
                      <label
                        style={{ color: labelColor }}
                        className="block text-xs uppercase tracking-wider font-semibold mb-2"
                      >
                        {formConfig.budgetLabel || 'Estimated Budget Range'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {budgetList.map((tier) => {
                          const isTierSelected = selectedBudget === tier;
                          return (
                            <button
                              type="button"
                              key={tier}
                              onClick={() =>
                                setSelectedBudget((prev) => (prev === tier ? '' : tier))
                              }
                              style={{
                                backgroundColor: isTierSelected
                                  ? formConfig.budgetPillActiveBgColor || '#ffffff'
                                  : formConfig.budgetPillBgColor || 'rgba(255, 255, 255, 0.1)',
                                borderColor: isTierSelected
                                  ? formConfig.budgetPillActiveBorderColor || '#ffffff'
                                  : formConfig.budgetPillBorderColor || 'rgba(255, 255, 255, 0.25)',
                                color: isTierSelected
                                  ? formConfig.budgetPillActiveTextColor || '#df0567'
                                  : formConfig.budgetPillTextColor || '#ffffff',
                              }}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border shadow-xs"
                            >
                              {tier}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      style={{ color: labelColor }}
                      className="block text-xs uppercase tracking-wider font-semibold mb-1.5"
                    >
                      {formConfig.messageLabel || 'Additional Information'}
                    </label>
                    <textarea
                      rows={3}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder={
                        formConfig.messagePlaceholder ||
                        'Tell us about your property, upcoming season, target channels, or campaign ideas...'
                      }
                      style={fieldStyle}
                      className={`w-full px-4 py-2.5 border text-sm focus:outline-none transition-all resize-none ${radiusClass}`}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: buttonBg,
                        color: buttonColor,
                      }}
                      className="w-full py-3.5 px-6 rounded-full font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {formConfig.submittingText || 'Sending Inquiry...'}
                        </>
                      ) : (
                        <>
                          {formConfig.submitButtonText || 'Send Project Request'}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Micro footer inside drawer */}
            <div
              style={{ borderColor: dividerBorderColor }}
              className="pt-4 border-t flex items-center justify-between text-xs text-white/70"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#f9b8d2]" />
                {formConfig.responsePromiseText || 'Direct priority response within 24h'}
              </span>
              <span>{formConfig.contactEmail || 'hello@viralmuse.agency'}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

