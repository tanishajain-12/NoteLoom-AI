import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import { Sparkles, ArrowRight, BookOpen, Clock, ChartBar, LightBulb, Check } from '../icons'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Summaries',
    description: 'Transform hours of lectures and meetings into concise, actionable summaries in seconds.',
  },
  {
    icon: LightBulb,
    title: 'Key Points Extraction',
    description: 'Automatically identify and highlight the most important concepts from any transcript.',
  },
  {
    icon: Check,
    title: 'Action Items',
    description: 'Never miss a task again. NoteLoom AI extracts action items and follow-ups automatically.',
  },
  {
    icon: BookOpen,
    title: 'Quiz Generation',
    description: 'Generate quiz questions from your notes to reinforce learning and test understanding.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Paste Your Transcript',
    description: 'Upload or paste your lecture or meeting transcript into the dashboard.',
  },
  {
    number: '02',
    title: 'AI Processing',
    description: 'Our AI engine analyzes the content, extracting summaries, key points, and action items.',
  },
  {
    number: '03',
    title: 'Review & Export',
    description: 'Review your structured notes, copy to clipboard, or download for offline use.',
  },
]

const pricing = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['10 summaries / month', 'Basic key points', 'Copy & download', '7-day history'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    features: ['Unlimited summaries', 'Quiz generation', 'Action items', 'Full history', 'Priority processing'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    features: ['Everything in Pro', '5 team members', 'Shared history', 'Collaborative notes', 'Admin dashboard'],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

function Landing() {
  return (
    <div className="min-h-screen bg-[#fbf9f8] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ffdad9]/30 via-[#fbf9f8] to-[#fbf9f8]"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ffdad9] px-4 py-1.5 text-sm font-medium text-[#592628] mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Note Summarization
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1b1c1c] leading-tight tracking-tight">
                Turn hours of lectures & meetings into{' '}
                <span className="text-[#8a4d4e]">minutes of insight</span>
              </h1>
              <p className="mt-6 text-lg text-[#524343] leading-relaxed max-w-2xl mx-auto">
                NoteLoom AI uses advanced AI to transform your lecture transcripts and meeting notes into
                structured summaries, key points, action items, and quizzes — all in seconds.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="primary" size="lg" to="/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" to="/login">
                  Log in
                </Button>
              </div>
              <p className="mt-4 text-xs text-[#857372]">No credit card required · Free forever plan</p>
            </div>

            {/* Hero preview card */}
            <div className="mt-16 mx-auto max-w-4xl">
              <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e4e2e1] bg-[#f6f3f2]">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#d48c8c]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#d9e4ec]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#e4e2e1]"></div>
                  </div>
                  <span className="ml-2 text-xs text-[#857372]">noteloom-ai.app/dashboard</span>
                </div>
                <div className="p-6 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[#f6f3f2] border border-[#e4e2e1] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-[#8a4d4e] flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="h-3 w-24 rounded bg-[#e4e2e1]"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-[#e4e2e1]"></div>
                      <div className="h-2 w-5/6 rounded bg-[#e4e2e1]"></div>
                      <div className="h-2 w-4/6 rounded bg-[#e4e2e1]"></div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f6f3f2] border border-[#e4e2e1] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-[#556066] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="h-3 w-20 rounded bg-[#e4e2e1]"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-[#ffdad9]"></div>
                      <div className="h-2 w-4/5 rounded bg-[#ffdad9]"></div>
                      <div className="h-2 w-3/5 rounded bg-[#ffdad9]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y border-[#e4e2e1] bg-[#f6f3f2]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '50K+', label: 'Notes Summarized' },
                { value: '10K+', label: 'Active Users' },
                { value: '94%', label: 'Accuracy Rate' },
                { value: '23h', label: 'Avg. Time Saved' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-extrabold text-[#8a4d4e]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#524343]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1b1c1c]">
                Everything you need to learn faster
              </h2>
              <p className="mt-4 text-lg text-[#524343]">
                Powerful AI features designed to help you absorb and retain information efficiently.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffdad9] mb-4">
                      <Icon className="w-6 h-6 text-[#8a4d4e]" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#1b1c1c] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[#524343] leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20 sm:py-28 bg-[#f6f3f2] border-y border-[#e4e2e1]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1b1c1c]">
                How it works
              </h2>
              <p className="mt-4 text-lg text-[#524343]">
                Three simple steps from raw transcript to structured notes.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-display text-4xl font-extrabold text-[#d48c8c]">{step.number}</span>
                    <div className="h-px flex-1 bg-[#d7c2c1]"></div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1b1c1c] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#524343] leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1b1c1c]">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-[#524343]">
                Start free, upgrade when you need more. No hidden fees.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricing.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-6 ${
                    plan.highlighted
                      ? 'bg-white border-[#8a4d4e] shadow-lg ring-1 ring-[#8a4d4e]'
                      : 'bg-white border-[#e4e2e1] shadow-sm'
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#8a4d4e] px-3 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold text-[#1b1c1c]">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-[#1b1c1c]">{plan.price}</span>
                    <span className="text-sm text-[#857372]">/ {plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm text-[#524343]">
                        <Check className="w-4 h-4 text-[#8a4d4e] shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      size="md"
                      to="/signup"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-[#8a4d4e] to-[#6e3637] px-6 py-14 sm:py-20 text-center">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                Ready to supercharge your notes?
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                Join thousands of students and professionals who save hours every week with NoteLoom AI.
              </p>
              <div className="mt-8">
                <Button variant="soft" size="lg" to="/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Landing
