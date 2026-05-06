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
  Star,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { cn } from './lib/utils';
import { analyzeTweetWithConsensus, getAnalysisHistory } from './services/genlayerService';
import { AnalysisResult } from './types';

// --- Components ---

const Navbar = ({ onNavigate, currentPage }: { onNavigate: (page: string) => void, currentPage: string }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
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
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 group"
        >
          <div className="p-1 px-1.5 gradient-bg rounded-lg group-hover:scale-110 transition-transform">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">TweetJudge</span>
        </button>

        <div className="glass-card px-2 py-1 flex items-center gap-1 md:gap-2 border-white/10">
          <button 
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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
             if (target) {
               target.scrollIntoView({ behavior: 'smooth' });
             } else {
               window.scrollTo({ top: 300, behavior: 'smooth' });
             }
          }}
          className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-widest hidden md:flex items-center gap-2"
        >
          Try It Now <Plus className="w-3 h-3" />
        </button>
        
        {/* Mobile Try It Now */}
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

const ScoreCard = ({ title, score, total = 100, colorClass, subtitle }: { title: string, score: number, total?: number, colorClass: string, subtitle?: string }) => (
  <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
    <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br from-white to-transparent", colorClass)} />
    <span className="text-gray-400 text-sm font-medium mb-1 z-10">{title}</span>
    <div className="flex items-baseline gap-1 z-10">
      <span className={cn("text-5xl font-display font-bold", colorClass)}>{score}</span>
      <span className="text-gray-500 text-lg">/{total}</span>
    </div>
    {subtitle && <p className="text-gray-500 text-xs mt-2 z-10">{subtitle}</p>}
  </div>
);

// --- Pages ---

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
            <span className={cn(
              "text-xs font-medium",
              tweet.length > maxLength ? "text-red-500" : "text-gray-500"
            )}>
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

const ResultPage = ({ result, onBack, onNewAnalysis }: { result: AnalysisResult, onBack: () => void, onNewAnalysis: () => void }) => {
  const [showFullReasoning, setShowFullReasoning] = React.useState(false);
  const [displayedContent, setDisplayedContent] = React.useState(result.improvedTweet);

  const handlePostAnyway = () => {
    const text = displayedContent;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareResult = async () => {
    const appUrl = window.location.origin;
    const summary = `📊 TweetJudge Analysis:\n🔥 Virality: ${result.viralityScore}%\n⚠️ Backlash Risk: ${result.backlashRisk}%\n\nJudge your posts before you drag yourself with AI Consensus at ${appUrl}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'TweetJudge Analysis Result',
          text: summary,
          url: appUrl
        });
      } else {
        await navigator.clipboard.writeText(summary);
        alert('Analysis summary copied to clipboard! Share it with your friends.');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </button>
        <span className="font-display text-xl font-bold tracking-tight">Analysis Result</span>
        <button 
          onClick={onNewAnalysis}
          className="btn-primary py-2 px-4 text-sm"
        >
          New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Metrics */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScoreCard 
            title="Virality Score" 
            score={result.viralityScore} 
            colorClass="text-emerald-500" 
            subtitle="High potential to go viral" 
          />
          <ScoreCard 
            title="Backlash Risk" 
            score={result.backlashRisk} 
            colorClass="text-orange-500" 
            subtitle="High risk of backlash" 
          />
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-400 text-sm font-medium mb-1">Validator Consensus</span>
            <div className="relative w-32 h-32 mb-2 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64" cy="64" r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-white/5"
                />
                <circle
                  cx="64" cy="64" r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * (100 - result.consensusDisagreement)) / 100}
                  strokeLinecap="round"
                  className="text-accent-purple"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-bold">{100 - result.consensusDisagreement}%</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Agree</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">{result.consensusDisagreement}% Moderate/Low</p>
          </div>
        </div>

        {/* Audience Breakdown */}
        <div className="lg:col-span-2 glass-card p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            Audience Breakdown
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-emerald-400">Likely to Agree</p>
                <p className="text-gray-400 text-sm leading-relaxed">{result.audienceBreakdown.agree}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 mt-1">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-orange-400">Likely to Attack</p>
                <p className="text-gray-400 text-sm leading-relaxed">{result.audienceBreakdown.attack}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-gray-500/10 text-gray-400 mt-1">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-300">Likely to Ignore</p>
                <p className="text-gray-500 text-sm leading-relaxed">{result.audienceBreakdown.ignore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reasoning and Validators */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 flex-1">
            <h3 className="font-bold mb-4">Why This Will Get Attention</h3>
            <ul className="space-y-3">
              {result.reasoningPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-accent-purple mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-6 flex-1 bg-white/[0.02]">
            <h3 className="font-bold mb-4">Validator Opinions</h3>
            <div className="space-y-4">
              {result.validatorOpinions.map((vo, i) => (
                <div key={i} className="flex flex-col gap-1 py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 font-medium">{vo.name}</span>
                    <span className={cn(
                      "font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider",
                      vo.opinion.includes('Concerned') || vo.opinion.includes('High') ? "bg-red-500/10 text-red-500" : 
                      vo.opinion.includes('Optimistic') || vo.opinion.includes('Safe') ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                    )}>{vo.opinion}</span>
                  </div>
                  <AnimatePresence>
                    {showFullReasoning && (
                      <motion.p 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-[11px] text-gray-500 overflow-hidden leading-relaxed italic"
                      >
                        "{vo.detail}"
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <button 
                onClick={() => setShowFullReasoning(!showFullReasoning)}
                className="text-xs text-accent-purple font-medium mt-2 w-full text-right hover:underline"
              >
                {showFullReasoning ? "Hide full reasoning ↑" : "View full reasoning →"}
              </button>
            </div>
          </div>
        </div>

        {/* Improved Tweet */}
        <div className="lg:col-span-2 glass-card p-10 bg-accent-purple/5 border-accent-purple/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 blur-3xl -z-10" />
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent-purple" />
              Improved Tweet <span className="text-gray-500 text-xs font-normal opacity-70">(Recommended)</span>
            </h3>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(displayedContent);
                  alert('Copied to clipboard!');
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/10 active:scale-90"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button 
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: 'My Improved Post',
                        text: displayedContent,
                        url: window.location.href,
                      });
                    } else {
                      // Fallback: Copy to clipboard and alert
                      await navigator.clipboard.writeText(displayedContent);
                      alert('Share not supported on this browser. Content copied to clipboard!');
                    }
                  } catch (err) {
                    console.error('Share failed:', err);
                  }
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/10 active:scale-90"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 border-dashed">
            <p className={cn(
              "leading-relaxed text-white font-medium italic select-all",
              displayedContent.length > 300 ? "text-lg" : "text-2xl"
            )}>
              "{displayedContent}"
            </p>
          </div>
        </div>

        {/* Variations */}
        <div className="lg:col-span-3 mt-12">
          <h3 className="font-bold mb-8 text-2xl flex items-center gap-2">
            <Filter className="w-6 h-6 text-accent-pink" />
            Analysis Variations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {result.variants.map((v, i) => (
              <div key={i} className="glass-card p-6 group hover:border-accent-purple/50 transition-all flex flex-col justify-between hover:-translate-y-1">
                <div>
                  <div className={cn(
                    "p-3 rounded-2xl w-fit mb-6 transition-all ring-1 ring-white/10",
                    v.type === 'Safe' ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white" :
                    v.type === 'Balanced' ? "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white" :
                    v.type === 'Spicy' ? "bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white" :
                    "bg-red-500/10 text-red-400 group-hover:bg-red-500 group-hover:text-white"
                  )}>
                    {v.type === 'Safe' && <ShieldCheck className="w-6 h-6" />}
                    {v.type === 'Balanced' && <CheckCircle2 className="w-6 h-6" />}
                    {v.type === 'Spicy' && <span className="text-xl">🌶️</span>}
                    {v.type === 'Nuclear' && <span className="text-xl">☢️</span>}
                  </div>
                  <h4 className="font-bold text-xl mb-3">{v.type}</h4>
                  <p className="text-sm text-gray-500 mb-8 leading-relaxed line-clamp-3">{v.description}</p>
                </div>
                <button 
                  onClick={() => {
                    setDisplayedContent(v.tweet);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-accent-purple font-bold text-sm tracking-wide self-end flex items-center gap-1 group/btn hover:underline"
                >
                  Use This <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="lg:col-span-3 flex flex-col items-center mt-8">
          <button 
            onClick={handlePostAnyway}
            className="btn-primary w-full max-w-md py-4 text-xl flex items-center justify-center gap-3 transition-transform active:scale-95"
          >
            Post Anyway 😈
          </button>
          <button 
            onClick={handleShareResult}
            className="text-gray-500 hover:text-white text-xs mt-4 uppercase tracking-[0.2em] font-bold"
          >
            Get shareable result card
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ history, onResultSelect, onNavigate }: { history: AnalysisResult[], onResultSelect: (res: AnalysisResult) => void, onNavigate: (page: string) => void }) => {
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

const App = () => {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [currentResult, setCurrentResult] = React.useState<AnalysisResult | null>(null);
  const [history, setHistory] = React.useState<AnalysisResult[]>([]);
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

  const CONTRACT_ADDR = import.meta.env.VITE_CONTRACT_ADDRESS || import.meta.env.VITE_CONTRACT_ADDRES;

  // Load history on mount
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

  // Also refresh history when navigating to history page
  React.useEffect(() => {
    if (currentPage === 'history' && CONTRACT_ADDR) {
      getAnalysisHistory().then(setHistory).catch(console.error);
    }
  }, [currentPage, CONTRACT_ADDR]);

  const handleAnalyze = async (tweetText: string) => {
    setIsAnalyzing(true);
    setErrorDetails(null);
    try {
      // Use real GenLayer consensus
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
            <p className="text-gray-500 text-xs mt-12 bg-white/5 px-4 py-2 rounded-full">Bradbury Testnet usually takes 20-40 seconds</p>
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
