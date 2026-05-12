import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  History as HistoryIcon, 
  Info, 
  Lightbulb, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Share2,
  ChevronLeft,
  Filter,
  CheckCircle2,
  Trash2,
  ArrowLeftRight,
  TrendingUp,
  Zap,
  Flame
} from 'lucide-react';
import { cn } from './lib/utils';
import { analyzeTweetWithConsensus, getAnalysisHistory, getUserAddress } from './services/genlayerService';
import { AnalysisResult } from './types';

// --- Helpers ---

function sanitizeImprovedTweet(improved: string, original: string): string {
  let out = improved;
  if (!original.includes('—') && !original.includes('–')) {
    out = out.replace(/[—–]/g, '-');
  }
  if (!original.includes('#')) {
    out = out.replace(/#\w+/g, '').replace(/\s{2,}/g, ' ').trim();
  }
  const emojiRegex = /[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const originalHasEmoji = emojiRegex.test(original);
  if (!originalHasEmoji) {
    out = out.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  }
  return out;
}

// --- Components ---

const Navbar = ({ onNavigate, currentPage }: { onNavigate: (page: string) => void, currentPage: string }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6",
      isScrolled ? "py-3 bg-black/40 backdrop-blur-xl border-b border-white/5" : "py-6"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button 
          onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2 group"
        >
          <div className="p-1 px-1.5 gradient-bg rounded-lg group-hover:scale-110 transition-transform">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">TweetJudge</span>
        </button>

        <div className="glass-card px-2 py-1 flex items-center gap-1 md:gap-2 border-white/10">
          <button 
            onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={cn(
              "px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all rounded-lg",
              currentPage === 'home' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('history')}
            className={cn(
              "px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all rounded-lg",
              currentPage === 'history' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            History
          </button>
        </div>

        <button 
          onClick={() => {
            onNavigate('home');
            const target = document.getElementById('tweet-input-area');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-widest hidden md:flex items-center gap-2"
        >
          Try It Now <Plus className="w-3 h-3" />
        </button>
        
        <button 
          onClick={() => onNavigate('home')}
          className="md:hidden p-2 rounded-full bg-accent-purple text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

// --- InputPage (unchanged) ---
const InputPage = ({ onAnalyze }: { onAnalyze: (tweet: string) => void }) => {
  const [tweet, setTweet] = React.useState('');
  const maxLength = 10000;

  return (
    <div id="tweet-input-area" className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden -z-10 bg-radial-[circle_at_50%_0%] from-accent-purple/20 via-transparent to-transparent opacity-50" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Powered by GenLayer Consensus
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Will This <span className="text-accent-pink">Post</span> <br />
          <span className="text-emerald-400">Blow Up</span> or <br />
          Get You <span className="text-orange-500">Dragged</span>?
        </h1>
        <p className="text-gray-400 text-lg">
          AI consensus predicts virality, backlash, and audience reaction for tweets and long-form articles.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl relative"
      >
        <div className="glass-card p-6 border-white/20 shadow-2xl relative z-10">
          <textarea
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            placeholder="Write or paste your tweet, thread, or long-form post here..."
            className="w-full h-64 bg-transparent text-xl resize-none outline-none placeholder:text-gray-600"
          />
          <div className="flex items-center justify-between mt-4">
            <span className={cn("text-xs font-medium", tweet.length > maxLength ? "text-red-500" : "text-gray-500")}>
              {tweet.length.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
            <button
              onClick={() => onAnalyze(tweet)}
              disabled={!tweet.trim() || tweet.length > maxLength}
              className="btn-primary py-2 px-5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              Analyze Tweet <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute -inset-4 bg-accent-purple/10 blur-3xl rounded-[3rem] -z-10" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full text-center">
        <div className="p-4 flex flex-col items-center">
          <ShieldCheck className="w-8 h-8 text-accent-purple mb-4" />
          <h3 className="font-semibold mb-2">Multi-AI Consensus</h3>
          <p className="text-sm text-gray-500">Multiple AI validators analyze your tweet.</p>
        </div>
        <div className="p-4 flex flex-col items-center">
          <AlertCircle className="w-8 h-8 text-orange-400 mb-4" />
          <h3 className="font-semibold mb-2">Predict Reactions</h3>
          <p className="text-sm text-gray-500">See who will agree, attack, or ignore.</p>
        </div>
        <div className="p-4 flex flex-col items-center">
          <Lightbulb className="w-8 h-8 text-pink-400 mb-4" />
          <h3 className="font-semibold mb-2">Make It Better</h3>
          <p className="text-sm text-gray-500">Get improved versions for more impact.</p>
        </div>
      </div>
    </div>
  );
};

// --- ResultPage ---

/** Derive a 1-2 letter avatar from a validator name */
const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/** Map opinion text to a badge colour */
const opinionBadge = (opinion: string): { bg: string; text: string; dot: string } => {
  const lower = opinion.toLowerCase();
  if (lower.includes('concern') || lower.includes('high') || lower.includes('risk') || lower.includes('risky')) {
    return { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: '⚠️' };
  }
  if (lower.includes('optimis') || lower.includes('safe') || lower.includes('strong') || lower.includes('hits') || lower.includes('engag')) {
    return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: '✓' };
  }
  return { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: '✓' };
};

/** Avatar colours cycling */
const AVATAR_COLORS = [
  'bg-amber-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-violet-500',
];

/**
 * Per-variant score offsets relative to base scores.
 * Viral score delta and backlash risk delta for each variant type.
 */
const VARIANT_SCORE_OFFSETS: Record<string, { viralDelta: number; riskDelta: number }> = {
  ai:      { viralDelta: +12, riskDelta: -15 },
  safer:   { viralDelta:  +5, riskDelta: -25 },
  bolder:  { viralDelta: +18, riskDelta: +10 },
  viral:   { viralDelta: +28, riskDelta: +20 },
  nuclear: { viralDelta: +35, riskDelta: +40 },
};

const ResultPage = ({ result, onBack, onNewAnalysis }: { result: AnalysisResult, onBack: () => void, onNewAnalysis: () => void }) => {
  const [activeVariant, setActiveVariant] = React.useState<string | null>(null); // null = AI recommended
  const [copied, setCopied] = React.useState(false);
  const [usedVersion, setUsedVersion] = React.useState(false);

  const sanitizedImproved = React.useMemo(
    () => sanitizeImprovedTweet(result.improvedTweet, result.originalTweet),
    [result.improvedTweet, result.originalTweet]
  );

  const sanitizedVariants = React.useMemo(
    () => result.variants.map(v => ({
      ...v,
      tweet: sanitizeImprovedTweet(v.tweet, result.originalTweet),
    })),
    [result.variants, result.originalTweet]
  );

  const displayedContent = React.useMemo(() => {
    if (activeVariant === null) return sanitizedImproved;
    const found = sanitizedVariants.find(v => v.type.toLowerCase() === activeVariant);
    return found ? found.tweet : sanitizedImproved;
  }, [activeVariant, sanitizedImproved, sanitizedVariants]);

  // Compute scores for the currently active variant
  const activeScores = React.useMemo(() => {
    const key = activeVariant === null ? 'ai' : activeVariant;
    const offsets = VARIANT_SCORE_OFFSETS[key] ?? { viralDelta: +12, riskDelta: -15 };
    return {
      viral: Math.min(99, Math.max(1, result.viralityScore + offsets.viralDelta)),
      risk:  Math.min(99, Math.max(1, result.backlashRisk  + offsets.riskDelta)),
    };
  }, [activeVariant, result.viralityScore, result.backlashRisk]);

  // Derive a headline verdict
  const viralityHigh = result.viralityScore >= 70;
  const backlashHigh = result.backlashRisk >= 40;
  let verdictHeadline = '';
  let verdictSub = '';
  if (viralityHigh && backlashHigh) {
    verdictHeadline = "This tweet will blow up — but it's risky";
    verdictSub = "High viral potential with a real chance of backlash. The message is bold and will split your audience. GenLayer's validators mostly agree it will spark debate, not just likes.";
  } else if (viralityHigh && !backlashHigh) {
    verdictHeadline = "This tweet is primed to go viral 🔥";
    verdictSub = "Strong viral potential with low backlash risk. GenLayer validators agree this hits the right notes.";
  } else if (!viralityHigh && backlashHigh) {
    verdictHeadline = "Careful — this could backfire";
    verdictSub = "Low virality combined with high backlash risk. Consider softening the message or rephrasing for your audience.";
  } else {
    verdictHeadline = "This tweet is unlikely to trend";
    verdictSub = "Low viral potential and low backlash risk. It's safe, but may not get much reach. Try making it more opinionated or punchy.";
  }

  // Audience percentages
  const agreePercent = Math.round(Math.max(10, Math.min(80, 100 - result.backlashRisk - (100 - result.viralityScore) / 3)));
  const attackPercent = Math.round(result.backlashRisk * 0.5);
  const ignorePercent = Math.max(0, 100 - agreePercent - attackPercent);

  // Variant tab config
  type VariantKey = 'ai' | 'safer' | 'bolder' | 'viral' | 'nuclear';
  const variantTabs: Array<{ key: VariantKey | null; label: string; sub: string; icon: React.ReactNode }> = [
    { key: null, label: 'AI recommended', sub: 'Best overall', icon: <Zap className="w-4 h-4" /> },
    ...sanitizedVariants.map(v => {
      const k = v.type.toLowerCase();
      const icons: Record<string, React.ReactNode> = {
        safer: <ShieldCheck className="w-4 h-4" />,
        bolder: <Zap className="w-4 h-4" />,
        viral: <Flame className="w-4 h-4" />,
        nuclear: <span className="text-sm leading-none">☢️</span>,
      };
      const subs: Record<string, string> = {
        safer: 'Less backlash',
        bolder: 'More punchy',
        viral: 'Maximum reach',
        nuclear: 'Most extreme',
      };
      return {
        key: k as VariantKey,
        label: v.type.charAt(0).toUpperCase() + v.type.slice(1),
        sub: subs[k] || v.description?.slice(0, 20) || '',
        icon: icons[k] || <Zap className="w-4 h-4" />,
      };
    }),
  ];

  const activeVariantObj = activeVariant !== null
    ? sanitizedVariants.find(v => v.type.toLowerCase() === activeVariant)
    : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleUseVersion = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(displayedContent)}`;
    window.open(url, '_blank');
    setUsedVersion(true);
    setTimeout(() => setUsedVersion(false), 2000);
  };

  const handleShareResult = async () => {
    const appUrl = window.location.origin;
    const summary = `📊 TweetJudge Analysis:\n🔥 Virality: ${result.viralityScore}%\n⚠️ Backlash Risk: ${result.backlashRisk}%\n\nJudge your posts before you drag yourself with AI Consensus at ${appUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'TweetJudge Analysis Result', text: summary, url: appUrl });
      } else {
        await navigator.clipboard.writeText(summary);
        alert('Analysis summary copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={onNewAnalysis}
          className="btn-primary py-2 px-4 text-xs"
        >
          New Analysis
        </button>
      </div>

      {/* ── 1. Verdict Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-5 flex items-start gap-4"
      >
        <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400 shrink-0 mt-0.5">
          <Flame className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg leading-snug mb-1">{verdictHeadline}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{verdictSub}</p>
        </div>
      </motion.div>

      {/* ── 2. Three metric cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        {/* Viral chance */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Viral chance</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-bold text-3xl text-emerald-400">{result.viralityScore}</span>
            <span className="text-gray-500 text-sm">/100</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            {result.viralityScore >= 70 ? 'Very likely to spread' : result.viralityScore >= 40 ? 'Some potential' : 'Low reach likely'}
          </p>
        </div>

        {/* Rage bait risk */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Rage bait risk</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-bold text-3xl text-orange-400">{result.backlashRisk}</span>
            <span className="text-gray-500 text-sm">/100</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            {result.backlashRisk >= 60 ? 'People may come for you' : result.backlashRisk >= 30 ? 'Moderate controversy' : 'Mostly safe'}
          </p>
        </div>

        {/* AI validators agree */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI validators agree</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-bold text-3xl text-white">{100 - result.consensusDisagreement}%</span>
          </div>
          <p className="text-gray-500 text-[11px]">
            {100 - result.consensusDisagreement >= 70 ? 'Majority say post it' : 'Mixed validator signals'}
          </p>
        </div>
      </motion.div>

      {/* ── 3. Who will react and how ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-5"
      >
        <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mb-4">Who will react and how</h3>
        <div className="space-y-4">
          {/* Agree */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">👍</span>
                <span className="text-sm font-semibold text-white">Will agree with you</span>
              </div>
              <span className="text-sm font-bold text-white">{agreePercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${agreePercent}%` }}
                transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1.5">{result.audienceBreakdown.agree}</p>
          </div>
          {/* Attack */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🔥</span>
                <span className="text-sm font-semibold text-white">Will attack you</span>
              </div>
              <span className="text-sm font-bold text-white">{attackPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${attackPercent}%` }}
                transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full bg-red-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1.5">{result.audienceBreakdown.attack}</p>
          </div>
          {/* Scroll past */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">👁</span>
                <span className="text-sm font-semibold text-white">Will scroll past</span>
              </div>
              <span className="text-sm font-bold text-white">{ignorePercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ignorePercent}%` }}
                transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full bg-gray-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1.5">{result.audienceBreakdown.ignore}</p>
          </div>
        </div>
      </motion.div>

      {/* ── 4. What the AI validators said ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-5"
      >
        <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mb-4">What the AI validators said</h3>
        <div className="space-y-4">
          {result.validatorOpinions.map((vo, i) => {
            const badge = opinionBadge(vo.opinion);
            const initials = getInitials(vo.name);
            const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0", avatarColor)}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                    <span className="text-white text-sm font-semibold">{vo.name}</span>
                    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", badge.bg, badge.text)}>
                      {badge.dot} {vo.opinion}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{vo.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── 5. Choose your version (only box, AI-improved box removed) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-6"
      >
        <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mb-4">Choose your version</h3>

        {/* Tab row */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
          {variantTabs.map((tab) => {
            const isActive = activeVariant === tab.key;
            return (
              <button
                key={String(tab.key)}
                onClick={() => setActiveVariant(tab.key)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border text-center min-w-[90px] shrink-0 transition-all",
                  isActive
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/15 hover:text-white"
                )}
              >
                <span className={cn("text-xs", isActive ? "text-white" : "text-gray-500")}>{tab.icon}</span>
                <span className="text-xs font-bold leading-tight">{tab.label}</span>
                <span className="text-[10px] text-gray-500 leading-tight">{tab.sub}</span>
              </button>
            );
          })}
        </div>

        {/* Active variant preview — scores update per selection, text shown in full */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-4">
          <div className="flex items-start gap-3 mb-3 flex-wrap">
            <span className="text-sm font-bold text-white capitalize">
              {activeVariant === null ? 'AI recommended' : activeVariant}
            </span>
            {activeVariantObj && (
              <span className="text-[11px] text-gray-400">{activeVariantObj.description}</span>
            )}
            {/* Scores: always shown, always reflect the active variant */}
            <div className="flex gap-2 ml-auto">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`viral-${activeVariant}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400"
                >
                  Viral {activeScores.viral}/100 — {activeScores.viral >= 80 ? 'very likely' : activeScores.viral >= 60 ? 'likely' : 'possible'}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`risk-${activeVariant}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400"
                >
                  Risk {activeScores.risk}/100 — {activeScores.risk >= 60 ? 'high' : activeScores.risk >= 30 ? 'moderate' : 'low'}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Full text — no truncation */}
          <AnimatePresence mode="wait">
            <motion.p
              key={displayedContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words"
            >
              {displayedContent}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Copy + Use buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleUseVersion}
            className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-bold transition-all flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            Use this version
          </button>
        </div>
      </motion.div>

      {/* ── 6. Share result ── */}
      <div className="flex flex-col items-center gap-3">
        <button 
          onClick={handleShareResult}
          className="text-gray-500 hover:text-white text-xs uppercase tracking-[0.2em] font-bold transition-colors"
        >
          Get shareable result card
        </button>
      </div>
    </div>
  );
};

// --- HistoryPage (unchanged) ---
const HistoryPage = ({ history, onResultSelect, onNavigate }: { history: AnalysisResult[], onResultSelect: (res: AnalysisResult) => void, onNavigate: (page: string) => void }) => {
  const [copied, setCopied] = React.useState(false);
  const userAddress = getUserAddress();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </button>
        <span className="font-display text-xl font-bold tracking-tight">Your Private Analyses</span>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to clear your local history view? This won\'t delete data from the blockchain but will remove it from this cache.')) {
              localStorage.removeItem('tweetjudge_account_pk');
              window.location.reload();
            }
          }}
          className="text-red-400 text-sm hover:underline flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Reset Identity
        </button>
      </div>

      <div className="mb-6 glass-card p-4 border border-white/10 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Your Wallet Address</p>
          <p className="font-mono text-sm text-gray-300 truncate">{userAddress}</p>
        </div>
        <button
          onClick={handleCopyAddress}
          className="ml-4 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
        >
          {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Viral', 'Risky'].map(tab => (
          <button 
            key={tab}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              tab === 'All' ? "bg-accent-purple text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No analysis history found for this account.</p>
          </div>
        ) : (
          history.map((item, i) => (
            <div 
              key={i} 
              onClick={() => onResultSelect(item)}
              className="glass-card p-6 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer transform hover:-translate-y-1"
            >
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-gray-200 font-medium truncate mb-1">"{item.originalTweet}"</p>
                <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-emerald-500 font-display font-bold text-xl">{item.viralityScore}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Virality</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-500 font-display font-bold text-xl">{item.backlashRisk}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">Risk</div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-accent-purple group-hover:translate-x-1 transition-all rotate-180" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- App (unchanged) ---
const App = () => {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<AnalysisResult | null>(null);
  const [history, setHistory] = React.useState<AnalysisResult[]>([]);
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

  const CONTRACT_ADDR = import.meta.env.VITE_CONTRACT_ADDRESS;

  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const hist = await getAnalysisHistory();
        if (hist.length > 0) setHistory(hist);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    if (CONTRACT_ADDR) loadHistory();
  }, [CONTRACT_ADDR]);

  React.useEffect(() => {
    if (currentPage === 'history' && CONTRACT_ADDR) {
      getAnalysisHistory().then(setHistory).catch(console.error);
    }
  }, [currentPage, CONTRACT_ADDR]);

  const handleAnalyze = async (tweetText: string) => {
    setIsAnalyzing(true);
    setErrorDetails(null);
    try {
      const result = await analyzeTweetWithConsensus(tweetText);
      setCurrentResult(result);
      setHistory(prev => [result, ...prev]);
      setCurrentPage('result');
    } catch (error: any) {
      console.error(error);
      setErrorDetails(error.message || "Unknown error occurred during consensus.");
      alert(`Analysis Failed: ${error.message || "AI validators failed to reach consensus. Check console for details."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {!CONTRACT_ADDR && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-orange-500 text-white text-[10px] py-1 px-4 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Warning: VITE_CONTRACT_ADDRESS is not set. Go to Settings &gt; Secrets.
        </div>
      )}
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-dark/95 backdrop-blur-xl"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-accent-purple/20" />
              <div className="absolute inset-0 rounded-full border-4 border-accent-purple border-t-transparent animate-spin" />
              <AlertCircle className="absolute inset-0 m-auto w-8 h-8 text-accent-purple animate-pulse" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2 text-center px-6">GenLayer Consensus in Progress...</h2>
            <p className="text-gray-400 text-center px-10">AI Validators are independently debating the potential virality and backlash risk of your tweet.</p>
            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-accent-purple animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-accent-purple animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-accent-purple animate-bounce" />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Verifying Equivalence</p>
            </div>
            <p className="text-gray-500 text-xs mt-12 bg-white/5 px-4 py-2 rounded-full">Bradbury Testnet usually takes 2-5 minutes</p>
          </motion.div>
        ) : (
          <main key={currentPage}>
            {currentPage === 'home' && (
              <>
                {errorDetails && (
                  <div className="max-w-xl mx-auto mt-24 mb-0 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p><strong>Last error:</strong> {errorDetails}</p>
                    <button onClick={() => setErrorDetails(null)} className="ml-auto hover:text-white uppercase font-bold text-[10px]">Dismiss</button>
                  </div>
                )}
                <InputPage onAnalyze={handleAnalyze} />
              </>
            )}
            {currentPage === 'result' && currentResult && (
              <ResultPage 
                result={currentResult} 
                onBack={() => setCurrentPage('home')}
                onNewAnalysis={() => setCurrentPage('home')}
              />
            )}
            {currentPage === 'history' && (
              <HistoryPage 
                history={history} 
                onNavigate={setCurrentPage} 
                onResultSelect={(res) => {
                  setCurrentResult(res);
                  setCurrentPage('result');
                }}
              />
            )}
          </main>
        )}
      </AnimatePresence>

      <footer className="py-12 px-6 text-center text-gray-600 text-sm border-t border-white/5 bg-white/[0.01]">
        <p>© 2026 TweetJudge • Powered by GenLayer Multi-AI Consensus</p>
      </footer>
    </div>
  );
};

export default App;
