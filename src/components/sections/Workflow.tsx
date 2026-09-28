import { motion } from 'motion/react';
import { content } from '../../lib/content';

interface WorkflowProps {
  data?: {
    eyebrow?: string;
    heading?: string;
    steps?: Array<{
      n: string;
      title: string;
      copy: string;
    }>;
  };
}

export default function Workflow({ data }: WorkflowProps = {}) {
  const heading = data?.heading || 'OUR WORKFLOW';
  const steps = data?.steps && data.steps.length > 0 ? data.steps : content.workflow.steps;

  return (
    <section
      id="workflow"
      data-theme="light"
      className="relative bg-white text-[#0A0A0A] pt-16 sm:pt-24 lg:pt-32 pb-24 sm:pb-36 select-none overflow-hidden"
    >
      {/* Full-Width Section Headline: OUR WORKFLOW (Edge-to-Edge) */}
      <div className="w-full overflow-hidden text-center mb-12 sm:mb-16 lg:mb-20 px-0 py-2 sm:py-4">
        <h2
          id="workflow-headline"
          className="font-headline text-[18.2vw] sm:text-[19vw] md:text-[19.8vw] leading-[0.9] sm:leading-[0.88] tracking-[0.01em] uppercase text-[#df0567] font-bold block whitespace-nowrap select-none drop-shadow-xs pb-2 sm:pb-3"
        >
          {heading}
        </h2>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 sm:px-12">
        {/* 4 Numbered Steps */}
        <div className="space-y-0 border-t border-[#df0567]/30">
          {steps.map((step, idx) => (
            <motion.div
              key={step.n || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="py-8 sm:py-12 border-b border-[#df0567]/30 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-12 items-baseline group hover:bg-[#fdf2f7]/50 transition-colors px-2 sm:px-4 -mx-2 sm:-mx-4 rounded-xl"
            >
              {/* Step Title with Number */}
              <div className="md:col-span-6 flex items-baseline gap-3 sm:gap-4">
                <span className="font-sans text-xl sm:text-2xl md:text-3xl font-semibold text-[#df0567]">
                  {step.n}.
                </span>
                <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-semibold text-[#df0567] leading-tight group-hover:translate-x-1 transition-transform">
                  {step.title}
                </h3>
              </div>

              {/* Supporting description copy */}
              <div className="md:col-span-6">
                <p className="text-base sm:text-lg text-[#0A0A0A]/85 font-normal leading-relaxed max-w-xl">
                  {step.copy}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
