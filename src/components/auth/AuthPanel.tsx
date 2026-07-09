import { 
  TrendingUp, 
  Quote, 
  Zap 
} from 'lucide-react';

/**
 * AuthPanel — shared left-side decorative panel for login & signup pages.
 * Displays a premium light-themed preview of the workspace dashboard board.
 */
export function AuthPanel() {
  return (
    <aside className="relative hidden flex-1 flex-col overflow-hidden bg-slate-50 border-r border-slate-100 lg:flex">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.06),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.04),transparent_50%)]" />
      
      {/* Animated Glowing blobs */}
      <div className="absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-indigo-200/20 blur-[120px] animate-pulse duration-[8000ms]" />
      <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-violet-200/20 blur-[120px] animate-pulse duration-[10000ms]" />

      {/* Grid Pattern overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(99,102,241,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between px-14 py-12">
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100/50">
            <span className="text-base font-black tracking-tighter bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              PWT
            </span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800 leading-none">
              Project Work
            </p>
            <p className="text-[13px] font-bold text-indigo-600 leading-none mt-0.5">
              Tracker
            </p>
          </div>
        </div>

        {/* Middle content: Workspace Preview */}
        <div className="my-auto py-8">
          <div className="max-w-[420px] mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
              <Zap className="h-3 w-3" />
              <span>Speed up your workflow</span>
            </div>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Track your work,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                elevate
              </span>{' '}
              your output
            </h2>
            <p className="mt-3 text-slate-500 text-sm leading-relaxed">
              The collaborative dashboard designed to help product teams align on tasks, monitor milestone progress, and ship higher quality code.
            </p>
          </div>

          {/* Interactive Workspace Widget */}
          <div className="relative rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-md">
            
            {/* Window control dots */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f87171' }} />
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#34d399' }} />
                <span className="ml-2 text-xs font-bold text-slate-500">Weekly Performance</span>
              </div>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">Live Update</span>
            </div>

            {/* Performance Chart SVG */}
            <div className="relative h-32 w-full mb-4">
              <svg className="w-full h-full" viewBox="0 0 400 120">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="70" x2="400" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="110" x2="400" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                
                {/* Area path */}
                <path d="M 0 110 L 50 85 L 100 95 L 150 50 L 200 65 L 250 35 L 300 45 L 350 15 L 400 20 L 400 120 L 0 120 Z" fill="url(#chartGrad)" />
                
                {/* Line path */}
                <path d="M 0 110 L 50 85 L 100 95 L 150 50 L 200 65 L 250 35 L 300 45 L 350 15 L 400 20" fill="none" stroke="url(#lineGrad)" strokeWidth="3" />
                
                {/* Chart Dots */}
                <circle cx="150" cy="50" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="250" cy="35" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="350" cy="15" r="4.5" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
              {/* Overlay stats badges */}
              <div className="absolute top-2 left-4 rounded-lg bg-slate-900 px-2 py-1 text-[9px] font-bold text-white shadow-sm flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span>Velocity: +42%</span>
              </div>
            </div>

            {/* Simulated Active Feed */}
            <div className="flex items-center justify-between border-t border-slate-100/80 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#ec4899' }}>EK</div>
                  <div className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#3b82f6' }}>MD</div>
                  <div className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: '#10b981' }}>LT</div>
                </div>
                <span className="text-[11px] font-bold text-slate-500">3 team members active</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Syncing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="border-t border-slate-200/60 pt-8">
          <div className="flex items-start gap-3">
            <Quote className="h-6 w-6 text-indigo-400/30 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-600 text-xs italic leading-relaxed">
                &ldquo;Project Work Tracker has completely unified our team. We can manage roadmaps, track bugs, and measure velocity in one beautiful workspace.&rdquo;
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-extrabold text-indigo-700" style={{ backgroundColor: '#e0e7ff' }}>ER</div>
                <p className="text-[10px] font-extrabold text-slate-800">
                  Elena Rostova <span className="font-semibold text-slate-400 ml-1">Head of Dev at Vercel</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
