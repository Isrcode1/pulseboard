import React from 'react'

export default function Home() {
  const handleLogin = () => {
    window.location.href = '/api/auth/auth/github/login'
  }

  // Programmatic generation of contributions grid cells
  // 7 rows x 38 columns to mimic the GitHub contributions chart
  const contributionGrid = []
  // Generate random frequencies to match the screenshot (shades of dark gray and blue)
  // 0: empty/dark gray, 1: light blue, 2: mid blue, 3: bright cyan, 4: vivid blue
  const colors = [
    'bg-[#1e293b]', // level 0 (gray-800)
    'bg-blue-600/20', // level 1
    'bg-blue-500/40', // level 2
    'bg-blue-400/70', // level 3
    'bg-blue-400' // level 4
  ]

  // Let's seed a representation that looks like a real chart
  for (let row = 0; row < 7; row++) {
    const rowCells = []
    for (let col = 0; col < 38; col++) {
      // Create a pattern of contribution activity
      let level = 0
      const rand = Math.random()
      if (rand > 0.85) level = 4
      else if (rand > 0.7) level = 3
      else if (rand > 0.5) level = 2
      else if (rand > 0.25) level = 1
      rowCells.push(level)
    }
    contributionGrid.push(rowCells)
  }

  return (
    <div className="min-h-screen bg-[#090b11] text-slate-100 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden relative">
      
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* 1. HEADER / NAVIGATION */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900/50 shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-white font-display">
            Pulse<span className="text-orange-500">Board</span>
          </span>
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          <a href="#explore" className="hover:text-white transition-colors">Explore</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <button 
          onClick={handleLogin}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800 bg-[#0e111a] hover:bg-slate-900 hover:border-slate-700 text-xs font-semibold text-white transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </button>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        
        {/* Public Beta Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-blue-500/20 bg-blue-950/20 text-[11px] text-blue-400 font-semibold mb-8">
          <span>🪄</span>
          <span>Now in Public Beta</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] font-display">
          One link. Your entire <span className="text-blue-500">dev career.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed font-sans">
          PulseBoard replaces GitHub, LinkedIn, your blog, and stale resumes with one auto-updating page that speaks your language.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleLogin}
            className="flex items-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Get your PulseBoard free
          </button>
          
          <div className="flex items-center px-4 py-3.5 bg-[#0e111a] border border-slate-800 rounded-xl w-full sm:w-auto justify-center">
            <span className="text-slate-400 text-xs font-mono select-all">pulseboard.duckdns.org/p/username</span>
          </div>
        </div>

      </section>

      {/* 3. MOCKUP BROWSER WINDOW */}
      <section className="max-w-4xl mx-auto px-6 pb-28 relative z-10">
        <div className="rounded-xl border border-slate-800 bg-[#090b14]/90 shadow-2xl overflow-hidden backdrop-blur-md">
          
          {/* Browser Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0e111c] border-b border-slate-900 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
            </div>
            <div className="bg-[#171c2d] text-slate-400 text-[10px] font-mono px-6 py-1 rounded-md max-w-sm truncate border border-slate-850">
              pulseboard.duckdns.org/p/alex_dev
            </div>
            <div className="w-12"></div>
          </div>

          {/* Browser Body (Alex Rivera Profile Mockup) */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-left bg-[#090b14]">
            
            {/* Left Column (Avatar, Bio, Skills) */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Profile card header */}
              <div className="flex items-center gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="Alex Rivera Profile" 
                  className="w-14 h-14 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">Alex Rivera</h3>
                  <p className="text-[11px] text-slate-400">Full-stack Cloud Architect</p>
                </div>
              </div>

              {/* Skills stack */}
              <div className="space-y-4 pt-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono block">SKILLS</span>
                
                {/* Skill 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-medium">
                    <span className="text-slate-300">TypeScript</span>
                    <span className="text-slate-450">84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>

                {/* Skill 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-medium">
                    <span className="text-slate-300">Go / Rust</span>
                    <span className="text-slate-455">62%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Contributions, Repos) */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Contributions Grid */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono block">CONTRIBUTIONS</span>
                
                <div className="p-4 bg-[#0e1220] border border-slate-800/80 rounded-lg overflow-x-auto no-scrollbar">
                  <div className="flex flex-col gap-1 min-w-[340px]">
                    {contributionGrid.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-1">
                        {row.map((level, cIdx) => (
                          <div 
                            key={cIdx} 
                            className={`w-2.5 h-2.5 rounded-[1px] transition-all hover:scale-125 ${colors[level]}`}
                          ></div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Repositories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Repo 1 */}
                <div className="p-4 bg-[#0e1220] border border-slate-800 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <svg className="w-3.5 h-3.5 text-blue-400 fill-current" viewBox="0 0 16 16">
                        <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path>
                      </svg>
                      pulse-core
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      High-performance event streaming engine for distributed systems.
                    </p>
                  </div>
                </div>

                {/* Repo 2 */}
                <div className="p-4 bg-[#0e1220] border border-slate-800 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <svg className="w-3.5 h-3.5 text-blue-400 fill-current" viewBox="0 0 16 16">
                        <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"></path>
                      </svg>
                      vector-db-lite
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      A minimal vector database written in pure Go.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. THE DEVELOPER IDENTITY CRISIS */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900/50 relative z-10 text-center">
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-display">
          The developer identity crisis
        </h2>
        <p className="text-slate-450 text-sm max-w-xl mx-auto mb-16">
          Why managing your presence feels like a second job.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Card 1 */}
          <div className="p-6 bg-[#0e111a] border border-slate-800/80 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">Portfolio maintenance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Writing code is fun. Updating your personal website's dependencies and text content is not. PulseBoard stays fresh automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-[#0e111a] border border-slate-800/80 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">Too many links</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              GitHub, LinkedIn, Portfolio, Medium, Twitter... unify your narrative into a single source of truth for recruiters.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-[#0e111a] border border-slate-800/80 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">Global presence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Especially for developers in Africa and emerging markets—bridge the visibility gap with a professional, global-standard profile.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-[#0e111a] border border-slate-800/80 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">Proving skills</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Show, don't just tell. We pull real data from your repos and contributions to validate your expertise level.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 bg-[#0e111a] border border-slate-800/80 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">Stale resumes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Static PDFs die the moment you hit 'save'. Your PulseBoard evolves as your data does, 24/7.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 bg-[#0e111a] border border-slate-800/80 rounded-xl space-y-4">
            <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">Dev visibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Don't let your best work rot in private repos. Showcase your aggregate impact without leaking sensitive code.
            </p>
          </div>

        </div>

      </section>

      {/* 5. 3-STEP WORKFLOW SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-slate-900/50 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          {/* Step 1 */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/10">
              1
            </div>
            <h3 className="text-base font-bold text-white">Sign in</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your GitHub account. We'll index your contributions and profile data instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/10">
              2
            </div>
            <h3 className="text-base font-bold text-white">Onboard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your theme, highlight key projects, and add your link. It takes less than 2 minutes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/10">
              3
            </div>
            <h3 className="text-base font-bold text-white">Share</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your permanent link is ready. Use it in bio, job applications, or as your email signature.
            </p>
          </div>

        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900/50 relative z-10 text-center">
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-display">
          Simple, dev-friendly pricing
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-16">
          Start for free, upgrade when you're ready to go pro.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Card 1: Free */}
          <div className="p-8 bg-[#0e111a]/90 border border-slate-800/80 rounded-xl flex flex-col justify-between text-left relative">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Free</h3>
                <div className="text-3xl font-extrabold text-white">
                  $0 <span className="text-sm font-medium text-slate-550">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-350">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> 1 PulseBoard Profile
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Auto-sync from GitHub
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Dark Theme Only
                </li>
              </ul>
            </div>

            <button 
              onClick={handleLogin}
              className="mt-8 w-full py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer text-center"
            >
              Get Started
            </button>
          </div>

          {/* Card 2: Pro (Highlighted) */}
          <div className="p-8 bg-[#0f142b]/95 border-2 border-blue-500 rounded-xl flex flex-col justify-between text-left relative shadow-xl shadow-blue-500/5">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-blue-400">
              Most Popular
            </div>

            <div className="space-y-6 mt-2">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Pro</h3>
                <div className="text-3xl font-extrabold text-white">
                  $4 <span className="text-sm font-medium text-slate-400">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> Custom Domain Support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> Advanced Analytics
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> 50+ Premium Themes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> Priority Indexing
                </li>
              </ul>
            </div>

            <button 
              onClick={handleLogin}
              className="mt-8 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md cursor-pointer text-center"
            >
              Go Pro
            </button>
          </div>

          {/* Card 3: Teams */}
          <div className="p-8 bg-[#0e111a]/90 border border-slate-800/80 rounded-xl flex flex-col justify-between text-left relative">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Teams</h3>
                <div className="text-3xl font-extrabold text-white">
                  $19 <span className="text-sm font-medium text-slate-450">/mo</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-350">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Up to 10 Team Members
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Team Leaderboard
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✓</span> Shared Skill Dashboard
                </li>
              </ul>
            </div>

            <button 
              onClick={handleLogin}
              className="mt-8 w-full py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer text-center"
            >
              Contact Sales
            </button>
          </div>

        </div>

      </section>

      {/* 7. BOTTOM CALL TO ACTION CARD */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="p-12 bg-gradient-to-br from-[#0e111c] to-[#0f142b] border border-slate-800 rounded-2xl text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Stop maintaining five profiles...
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
            Focus on shipping code. We'll handle the rest of your professional identity.
          </p>

          <button 
            onClick={handleLogin}
            className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Start your PulseBoard now
          </button>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#04060c] border-t border-slate-950 py-16 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo & Copyright */}
          <div className="md:col-span-5 space-y-4 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-white font-display">
                Pulse<span className="text-orange-500">Board</span>
              </span>
              <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
            </div>
            <p className="leading-relaxed max-w-xs text-slate-500 font-sans">
              &copy; 2026 PulseBoard Inc. Engineering First. Built for the next generation of software creators.
            </p>
          </div>

          {/* Links Column 1: Product */}
          <div className="md:col-span-2 space-y-3 text-left">
            <h4 className="font-bold text-white">Product</h4>
            <ul className="space-y-2">
              <li><a href="#changelog" className="hover:text-white transition-colors">Changelog</a></li>
              <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#status" className="hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>

          {/* Links Column 2: Company */}
          <div className="md:col-span-2 space-y-3 text-left">
            <h4 className="font-bold text-white">Company</h4>
            <ul className="space-y-2">
              <li><a href="#privacy" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#terms" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#support" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Links Column 3: Social */}
          <div className="md:col-span-3 space-y-3 text-left">
            <h4 className="font-bold text-white">Social</h4>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#mastodon" className="hover:text-white transition-colors p-1" title="Mastodon">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M21.32 9.5c-.22-2.45-1.62-4.54-4.04-5.14C14.7 3.75 12 3.8 12 3.8s-2.7-.05-5.28.56c-2.42.6-3.82 2.7-4.04 5.14-.14 1.5-.1 3.52-.08 4.72.04 2.5 1.63 4.8 4 5.25A12.3 12.3 0 0012 20.3a12.3 12.3 0 005.4-.83c2.37-.45 3.96-2.75 4-5.25.02-1.2.06-3.22-.08-4.72z" />
                </svg>
              </a>
              <a href="#twitter" className="hover:text-white transition-colors p-1" title="Twitter / X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#rss" className="hover:text-white transition-colors p-1" title="RSS Feed">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M5.5 19a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-.5-8.5A8.5 8.5 0 002.5 2V0A10.5 10.5 0 0113 10.5h-2zm0-5A3.5 3.5 0 002.5 2V0A5.5 5.5 0 018 5.5H5z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}
