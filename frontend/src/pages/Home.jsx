import React from 'react'
import { Link } from 'react-router-dom'
import {
  Github,
  Rocket,
  Wrench,
  Link2,
  Globe,
  BadgeCheck,
  History,
  Eye,
  Folder,
  CheckCircle2,
  AtSign,
  Rss,
  Share2
} from 'lucide-react'

const signIn = () => {
  window.location.href = '/api/auth/auth/github/login'
}

// Deterministic mock heatmap — 84 cells (12 weeks x 7 days)
const HEATMAP_LEVELS = [0.08, 0.2, 0.45, 0.75, 1]
const heatmapCells = Array.from({ length: 84 }, (_, i) => HEATMAP_LEVELS[(i * 13 + 5) % 5])

const PROBLEMS = [
  {
    icon: Wrench,
    title: 'Portfolio maintenance',
    body: "Writing code is fun. Updating your personal website's dependencies and text content is not. PulseBoard stays fresh automatically."
  },
  {
    icon: Link2,
    title: 'Too many links',
    body: 'GitHub, LinkedIn, Portfolio, Medium, Twitter... unify your narrative into a single source of truth for recruiters.'
  },
  {
    icon: Globe,
    title: 'Global presence',
    body: 'Especially for developers in Africa and emerging markets—bridge the visibility gap with a professional, global-standard profile.'
  },
  {
    icon: BadgeCheck,
    title: 'Proving skills',
    body: "Show, don't just tell. We pull real data from your repos and contributions to validate your expertise level."
  },
  {
    icon: History,
    title: 'Stale resumes',
    body: "Static PDFs die the moment you hit 'save'. Your PulseBoard evolves as your skills do, 24/7."
  },
  {
    icon: Eye,
    title: 'Dev visibility',
    body: "Don't let your best work rot in private repos. Showcase your aggregate impact without leaking sensitive code."
  }
]

const STEPS = [
  {
    n: 1,
    title: 'Sign in',
    body: "Connect your GitHub account. We'll index your contributions and profile data instantly."
  },
  {
    n: 2,
    title: 'Onboard',
    body: 'Pick your theme, highlight key projects, and add your bio. It takes less than 2 minutes.'
  },
  {
    n: 3,
    title: 'Share',
    body: 'Your permanent link is ready. Use it in bio, job applications, or as your email signature.'
  }
]

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    features: ['1 PulseBoard Profile', 'Auto-sync from GitHub', 'Dark Theme Only'],
    cta: 'Get Started',
    highlight: false
  },
  {
    name: 'Pro',
    price: '$4',
    features: ['Custom Domain Support', 'Advanced Analytics', '50+ Premium Themes', 'Priority Indexing'],
    cta: 'Go Pro',
    highlight: true
  },
  {
    name: 'Teams',
    price: '$19',
    features: ['Up to 10 Team Members', 'Team Leaderboard', 'Shared Skill Dashboard'],
    cta: 'Contact Sales',
    highlight: false
  }
]

function Logo() {
  return (
    <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight font-display">
      <span><span className="text-pb-primary">Pulse</span><span className="text-pb-orange">Board</span></span>
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-pb-orange" />
    </span>
  )
}

function GithubButton({ label, className = '' }) {
  return (
    <button
      onClick={signIn}
      className={`flex items-center gap-2 rounded-lg transition-all active:scale-95 ${className}`}
    >
      <Github size={20} />
      {label}
    </button>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-pb-bg text-pb-text selection:bg-pb-primary selection:text-white">

      {/* ── Top Nav ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-pb-border bg-pb-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden gap-6 md:flex">
              <Link to="/dashboard" className="text-sm text-pb-muted transition-colors hover:text-pb-primary">Dashboard</Link>
              <a href="#how" className="text-sm text-pb-muted transition-colors hover:text-pb-primary">Explore</a>
              <a href="#pricing" className="text-sm text-pb-muted transition-colors hover:text-pb-primary">Pricing</a>
            </div>
          </div>
          <GithubButton
            label={<span className="text-xs font-bold uppercase tracking-wider">Sign in with GitHub</span>}
            className="border border-pb-border bg-pb-surface px-4 py-2 text-white hover:bg-pb-surface-2"
          />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pb-12">

        {/* ── Hero ────────────────────────────────────── */}
        <section className="flex flex-col items-center py-16 text-center md:py-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pb-primary/20 bg-pb-primary/10 px-4 py-1 text-pb-primary">
            <Rocket size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Now in Public Beta</span>
          </div>

          <h1 className="mb-4 max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-display leading-[1.1]">
            One link. Your entire{' '}
            <span className="bg-gradient-to-br from-pb-primary-soft to-pb-primary bg-clip-text text-transparent">
              dev career.
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-lg text-pb-muted">
            PulseBoard replaces GitHub, LinkedIn, your blog, and stale resumes with
            one auto-updating page that speaks your language.
          </p>

          <div className="mb-14 flex flex-col items-center gap-4 md:flex-row">
            <GithubButton
              label={<span className="text-lg font-semibold">Get your PulseBoard free</span>}
              className="rounded-xl bg-pb-primary px-6 py-3.5 text-white hover:scale-105 hover:bg-blue-500"
            />
            <div className="rounded-lg border border-pb-border bg-pb-surface px-4 py-2.5 font-mono text-sm text-pb-primary">
              pulseboard.duckdns.org/p/yourname
            </div>
          </div>

          {/* Browser preview */}
          <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-pb-border bg-pb-surface shadow-2xl">
            <div className="flex h-10 items-center gap-1.5 border-b border-pb-border bg-pb-surface-3 px-4">
              <div className="h-3 w-3 rounded-full bg-red-500/40" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/40" />
              <div className="h-3 w-3 rounded-full bg-pb-primary/40" />
              <div className="flex flex-1 justify-center">
                <div className="w-64 rounded bg-pb-bg px-6 py-1 text-center font-mono text-xs text-pb-faint">
                  pulseboard.duckdns.org/p/alex_dev
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 text-left md:grid-cols-12 md:p-10">
              {/* Left column — identity + skills */}
              <div className="flex flex-col gap-4 md:col-span-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pb-primary to-pb-orange text-2xl font-extrabold text-white">
                    AR
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Alex Rivera</h3>
                    <p className="text-sm text-pb-muted">Full-stack Cloud Architect</p>
                  </div>
                </div>

                <div className="rounded-lg border border-pb-border bg-pb-bg p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-pb-faint">Skills</p>
                  <div className="space-y-3">
                    {[
                      { name: 'TypeScript', pct: 94 },
                      { name: 'Go / Rust', pct: 82 }
                    ].map(skill => (
                      <div key={skill.name}>
                        <div className="mb-1 flex justify-between font-mono text-xs text-pb-muted">
                          <span>{skill.name}</span>
                          <span>{skill.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-pb-surface-2">
                          <div className="h-full bg-pb-primary" style={{ width: `${skill.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column — contributions + repos */}
              <div className="flex flex-col gap-6 md:col-span-8">
                <div className="rounded-lg border border-pb-border bg-pb-bg p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-pb-faint">Contributions</p>
                  <div className="flex flex-wrap gap-1">
                    {heatmapCells.map((opacity, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-sm bg-pb-primary"
                        style={{ opacity }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    { name: 'pulse-core', desc: 'High-performance event streaming engine for distributed systems.' },
                    { name: 'vector-db-lite', desc: 'A minimal vector database written in pure Go.' }
                  ].map(repo => (
                    <div key={repo.name} className="rounded-lg border border-pb-border bg-pb-bg p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Folder size={16} className="text-pb-primary" />
                        <span className="font-mono text-sm font-semibold text-white">{repo.name}</span>
                      </div>
                      <p className="text-sm text-pb-muted">{repo.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problems ────────────────────────────────── */}
        <section className="py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-white font-display">The developer identity crisis</h2>
            <p className="text-pb-muted">Why managing your presence feels like a second job.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-pb-border bg-pb-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pb-primary/50"
              >
                <Icon size={32} className="mb-4 text-pb-primary" />
                <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
                <p className="text-sm text-pb-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ────────────────────────────── */}
        <section id="how" className="py-16">
          <div className="rounded-2xl border border-pb-border bg-pb-surface p-6 md:p-12">
            <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="absolute left-0 top-8 hidden h-px w-full bg-pb-border md:block" />
              {STEPS.map(step => (
                <div key={step.n} className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-pb-bg bg-pb-primary text-2xl font-semibold text-white">
                    {step.n}
                  </div>
                  <h4 className="mb-2 text-xl font-semibold text-white">{step.title}</h4>
                  <p className="text-sm text-pb-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────── */}
        <section id="pricing" className="py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-white font-display">Simple, dev-friendly pricing</h2>
            <p className="text-pb-muted">Start for free, upgrade when you're ready to go pro.</p>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {TIERS.map(tier => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-xl bg-pb-surface p-6 ${
                  tier.highlight
                    ? 'border-2 border-pb-primary shadow-xl md:scale-105'
                    : 'border border-pb-border'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-pb-primary px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-sm text-pb-muted">/mo</span>
                  </div>
                </div>
                <ul className="mb-10 flex-1 space-y-2">
                  {tier.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-pb-muted">
                      <CheckCircle2 size={16} className="shrink-0 text-pb-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={signIn}
                  className={`w-full rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    tier.highlight
                      ? 'bg-pb-primary text-white hover:opacity-90'
                      : 'border border-pb-border text-pb-text hover:bg-pb-surface-2'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="py-16">
          <div className="rounded-3xl border border-pb-border bg-gradient-to-br from-pb-surface to-pb-primary/10 p-10 text-center md:p-16">
            <h2 className="mb-4 text-3xl font-extrabold text-white font-display">
              Stop maintaining five profiles...
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-pb-muted">
              Focus on shipping code. We'll handle the rest of your professional identity.
            </p>
            <GithubButton
              label={<span className="text-lg font-semibold">Start your PulseBoard now</span>}
              className="mx-auto rounded-xl bg-pb-primary px-8 py-3.5 text-white hover:scale-105 hover:bg-blue-500"
            />
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-pb-border bg-[#0b0e15] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-pb-muted">
              © {new Date().getFullYear()} PulseBoard. Engineering First. Built for the
              next generation of software creators.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-pb-primary">Product</p>
              {['Changelog', 'Documentation', 'Status'].map(item => (
                <a key={item} href="#" className="text-sm text-pb-muted transition-colors hover:text-pb-orange">{item}</a>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-pb-primary">Company</p>
              {['Privacy', 'Terms', 'Support'].map(item => (
                <a key={item} href="#" className="text-sm text-pb-muted transition-colors hover:text-pb-orange">{item}</a>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-pb-primary">Social</p>
              <div className="flex gap-4">
                <a href="#" className="opacity-80 transition-opacity hover:opacity-100"><AtSign size={20} /></a>
                <a href="#" className="opacity-80 transition-opacity hover:opacity-100"><Share2 size={20} /></a>
                <a href="#" className="opacity-80 transition-opacity hover:opacity-100"><Rss size={20} /></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
