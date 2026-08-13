import React, { useRef, useState, useEffect } from 'react';
import {
  AlertCircle,
  Beaker,
  RotateCcw,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Swords,
  Globe2,
  Layers,
  BarChart2,
  Cpu,
} from 'lucide-react';
import { useExperiment } from './hooks/useExperiment';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ExperimentControls } from './features/content/ExperimentControls';
import { SocialPreview } from './features/content/SocialPreview';
import { SimulationProgress } from './features/simulation/SimulationProgress';
import { PersonaReactionCard } from './features/simulation/PersonaReactionCard';
import { AudienceMap } from './features/simulation/AudienceMap';
import { PersonaDebateStream } from './features/simulation/PersonaDebateStream';
import { ABTestingArena } from './features/simulation/ABTestingArena';
import { CrossPlatformMatrix } from './features/simulation/CrossPlatformMatrix';
import { ViralityScoreSection } from './features/scoring/ViralityScoreSection';
import { DiagnosticsSection } from './features/scoring/DiagnosticsSection';
import { OptimizationSection } from './features/optimization/OptimizationSection';
import { BeforeAfterStory } from './features/optimization/BeforeAfterStory';
import { Button } from './design-system/Button';
import { LandingPage } from './features/landing/LandingPage';

export function App() {
  const [view, setView] = useState<'landing' | 'studio'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash === '#studio' || params.get('view') === 'studio') {
        return 'studio';
      }
    }
    return 'landing';
  });

  const exp = useExperiment();
  const { result } = exp;
  const resultsRef = useRef<HTMLDivElement>(null);
  const [activeDeckTab, setActiveDeckTab] = useState<'all' | 'audit' | 'ab_arena' | 'matrix' | 'optimizer'>('all');

  // Automatically reset to 'all' modules whenever a new run or rerun starts or results arrive
  useEffect(() => {
    if (exp.status === 'running' || exp.result) {
      setActiveDeckTab('all');
    }
  }, [exp.currentRunId, exp.status]);

  // Sync hash with browser history
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#studio') {
        setView('studio');
      } else if (window.location.hash === '' || window.location.hash === '#home' || window.location.hash === '#landing') {
        setView('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLaunchStudio = (initialPrompt?: string, initialPlatform?: string) => {
    if (initialPrompt && initialPrompt.trim()) {
      exp.setCaption(initialPrompt);
    }
    if (initialPlatform) {
      exp.setPlatform(initialPlatform as any);
    }
    setView('studio');
    window.location.hash = '#studio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLanding = () => {
    setView('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSimulating = exp.status === 'running';
  const hasResults = !!result;

  const handleStart = async () => {
    setActiveDeckTab('all');
    await exp.startSimulation();
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  const handleDemo = () => {
    setActiveDeckTab('all');
    exp.runDemoSimulation();
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  // If user is on the Landing Page, render the rich Cyber-Brutalist landing experience
  if (view === 'landing') {
    return <LandingPage onLaunchStudio={handleLaunchStudio} />;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] flex flex-col relative overflow-x-hidden contour-grid-bg selection:bg-[#00FF41] selection:text-[#000000]">
      {/* Subtle CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_3px]" />

      {/* Header Masthead */}
      <Header
        health={exp.health}
        historyCount={exp.history.length}
        showBack={hasResults}
        onBackToStudio={exp.backToStudio}
        onGoToLanding={handleGoToLanding}
        onOpenHistory={() => exp.setIsHistoryOpen(true)}
        onReset={exp.resetExperiment}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8 relative z-10" role="main">
        {/* Editorial Inquiry & Specimen Presets */}
        <HeroSection onLoadSample={exp.loadSample} onRunDemo={handleDemo} />

        {/* Error Alert Bar */}
        {exp.error && (
          <div
            className="w-full bg-[#050805] border border-[#FF0055]/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-mono-tech shadow-[0_0_20px_rgba(255,0,85,0.15)]"
            role="alert"
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-4 h-4 text-[#FF0055] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase">
                  {exp.status === 'failed' ? 'EXECUTION FAILURE // RUN INTERRUPTED' : 'SYSTEM EXCEPTION ENCOUNTERED'}
                </span>
                <span className="text-xs text-red-300/90 font-sans">{exp.error}</span>
                <span className="text-[10px] text-[#8E9E90]">
                  Parameters preserved in studio buffer. Retry execution or benchmark against demo dataset.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3 h-3" />} onClick={handleStart}>
                RETRY
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<Beaker className="w-3 h-3" />} onClick={handleDemo}>
                TRY DEMO
              </Button>
              <button onClick={() => exp.setError(null)} className="p-1 text-white/50 hover:text-white cursor-pointer" aria-label="Dismiss error">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Demo Mode Indicator */}
        {exp.isDemo && hasResults && (
          <div className="w-full bg-[#050805] border border-[#00FF41]/40 p-3 flex items-center justify-between text-xs font-mono-tech text-[#00FF41] shadow-[0_0_15px_rgba(0,255,65,0.15)]" role="status">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">[ DEMO BENCHMARK DATASET ]</span>
              <span className="text-white/40">·</span>
              <span className="text-[#8E9E90] font-sans">Pre-calibrated baseline specimen for instant interface exploration.</span>
            </div>
            <button onClick={exp.resetExperiment} className="font-bold text-white hover:text-[#00FF41] cursor-pointer underline uppercase text-[11px]">
              EXIT DEMO
            </button>
          </div>
        )}

        {/* ───── Studio: Content & Parameter Configuration ───── */}
        {exp.phase === 'setup' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" aria-label="Content workspace">
            {/* Left 7 Cols: Experiment Parameter Controls */}
            <div className="lg:col-span-7 cyber-card corner-ticks p-5 sm:p-7 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b-2 border-[#00FF41]/20 pb-3 font-mechanismo text-[11px] text-[#8E9E90] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="text-[#00FF41] font-black bg-[#00FF41]/10 px-1.5 py-0.5 border border-[#00FF41]/40 shadow-[0_0_8px_rgba(0,255,65,0.2)]">01 // PARAMETERS</span>
                  <span className="text-white/40">::</span>
                  <span className="text-white font-bold">SPECIMEN & AUDIENCE CONFIGURATION</span>
                </div>
                <span className="bg-[#000000] px-2 py-0.5 border border-[#00FF41]/30 text-[#00F0FF] font-bold text-[10px]">CONFIG MODE</span>
              </div>

              <ExperimentControls
                platform={exp.platform} setPlatform={exp.setPlatform}
                caption={exp.caption} setCaption={exp.setCaption}
                transcript={exp.transcript} setTranscript={exp.setTranscript}
                selectedPersonas={exp.selectedPersonas} setSelectedPersonas={exp.setSelectedPersonas}
                objective={exp.objective} setObjective={exp.setObjective}
                optimizationEnabled={exp.optimizationEnabled} setOptimizationEnabled={exp.setOptimizationEnabled}
                mediaPath={exp.mediaPath} mediaUrl={exp.mediaUrl} mediaType={exp.mediaType}
                onMediaSelected={exp.handleMediaSelected} onMediaCleared={exp.handleMediaCleared}
                disabled={isSimulating}
              />
            </div>

            {/* Right 5 Cols: Specimen Monitor & Launch Action */}
            <div className="lg:col-span-5 flex flex-col items-center gap-5 lg:sticky lg:top-20">
              <SocialPreview platform={exp.platform} caption={exp.caption} mediaUrl={exp.mediaUrl} mediaType={exp.mediaType} />

              <div className="w-full flex flex-col gap-2">
                <Button
                  variant="viral"
                  size="xl"
                  className="w-full font-csmigrate text-sm font-black shadow-[4px_4px_0px_0px_#000]"
                  isLoading={isSimulating}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={handleStart}
                  disabled={isSimulating || !exp.caption.trim()}
                  aria-label={`Simulate audience with ${exp.selectedPersonas.length} agents`}
                >
                  {isSimulating
                    ? 'DELIBERATING AUDIENCE PANEL...'
                    : `EXECUTE EXPERIMENT (${exp.selectedPersonas.length} AGENTS)`}
                </Button>
                <div className="flex items-center justify-between font-mechanismo text-[10px] text-[#526355] px-1 uppercase font-bold">
                  <span>MULTIMODAL EXTRACTION</span>
                  <span>·</span>
                  <span>5 AGENT DELIBERATION</span>
                  <span>·</span>
                  <span>OPTIMIZATION</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ───── Simulation In-Progress State ───── */}
        {isSimulating && (
          <SimulationProgress
            status={exp.status}
            stage={exp.stage}
            progress={exp.progress}
            message={exp.message}
            runId={exp.currentRunId || undefined}
          />
        )}

        {/* ───── Results: Deep-Dive Cockpit & Decks ───── */}
        {hasResults && result && (
          <div ref={resultsRef} className="flex flex-col gap-8 scroll-mt-20">
            {/* Multi-Module Deck Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#00FF41]/20 pb-3 font-mono-tech text-xs">
              <span className="text-[#8E9E90] text-[10px] uppercase font-bold tracking-widest mr-2">MODULE VIEW //</span>

              <button
                type="button"
                onClick={() => setActiveDeckTab('all')}
                className={`px-3 py-1.5 uppercase font-black font-csmigrate border-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                  activeDeckTab === 'all'
                    ? 'bg-[#00FF41] text-[#000000] border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.4)]'
                    : 'bg-[#050805] text-[#8E9E90] border-[#00FF41]/20 hover:text-white hover:border-[#00FF41]/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                ALL MODULES
              </button>

              <button
                type="button"
                onClick={() => setActiveDeckTab('audit')}
                className={`px-3 py-1.5 uppercase font-black font-csmigrate border-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                  activeDeckTab === 'audit'
                    ? 'bg-[#00FF41] text-[#000000] border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.4)]'
                    : 'bg-[#050805] text-[#8E9E90] border-[#00FF41]/20 hover:text-white hover:border-[#00FF41]/60'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                01 // AUDIT & DEBATE
              </button>

              <button
                type="button"
                onClick={() => setActiveDeckTab('ab_arena')}
                className={`px-3 py-1.5 uppercase font-black font-csmigrate border-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                  activeDeckTab === 'ab_arena'
                    ? 'bg-[#00FF41] text-[#000000] border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.4)]'
                    : 'bg-[#050805] text-[#8E9E90] border-[#00FF41]/20 hover:text-white hover:border-[#00FF41]/60'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                02 // LIVE A/B ARENA
              </button>

              <button
                type="button"
                onClick={() => setActiveDeckTab('matrix')}
                className={`px-3 py-1.5 uppercase font-black font-csmigrate border-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                  activeDeckTab === 'matrix'
                    ? 'bg-[#00FF41] text-[#000000] border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.4)]'
                    : 'bg-[#050805] text-[#8E9E90] border-[#00FF41]/20 hover:text-white hover:border-[#00FF41]/60'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                03 // 5-PLATFORM MATRIX
              </button>

              <button
                type="button"
                onClick={() => setActiveDeckTab('optimizer')}
                className={`px-3 py-1.5 uppercase font-black font-csmigrate border-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                  activeDeckTab === 'optimizer'
                    ? 'bg-[#00FF41] text-[#000000] border-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.4)]'
                    : 'bg-[#050805] text-[#8E9E90] border-[#00FF41]/20 hover:text-white hover:border-[#00FF41]/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                04 // GENETIC OPTIMIZER
              </button>
            </div>

            {/* 1. Virality Potential Score & Audit Deck */}
            {(activeDeckTab === 'all' || activeDeckTab === 'audit') && (
              <>
                {result.score && (
                  <ViralityScoreSection
                    score={result.score}
                    optimizedScore={result.best_score || undefined}
                  />
                )}

                {result.score && (
                  <DiagnosticsSection
                    score={result.score}
                    contentProfile={result.content_profile}
                  />
                )}

                {result.simulation?.reactions && (
                  <AudienceMap
                    reactions={result.simulation.reactions}
                    totalPersonas={result.simulation.total_personas}
                    completedPersonas={result.simulation.completed_personas}
                  />
                )}

                {result.simulation?.reactions && (
                  <section className="flex flex-col gap-4 text-left" aria-label="Persona reactions">
                    <div className="flex flex-wrap items-center justify-between border-b border-[#00FF41]/20 pb-2 font-mono-tech text-[10px] text-[#8E9E90] uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <span className="text-[#00FF41] font-bold">04B // PERSONA DOSSIERS</span>
                        <span>::</span>
                        <span>GRANULAR AGENT DELIBERATION LEDGER</span>
                      </div>
                      <span>{result.simulation.completed_personas} DOSSIERS RECORDED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {result.simulation.reactions.map((rxn, idx) => (
                        <PersonaReactionCard key={rxn.persona_id || idx} reaction={rxn} />
                      ))}
                    </div>
                  </section>
                )}

                {result.simulation?.reactions && (
                  <PersonaDebateStream
                    reactions={result.simulation.reactions}
                    caption={exp.caption}
                    platform={exp.platform}
                  />
                )}
              </>
            )}

            {/* 2. Feature B: Live Multi-Variant A/B Head-to-Head Arena */}
            {(activeDeckTab === 'all' || activeDeckTab === 'ab_arena') && (
              <ABTestingArena
                originalCaption={exp.caption}
                candidateVariants={result.optimization?.candidate_variants}
                platform={exp.platform}
                mediaType={exp.mediaType}
                selectedPersonas={exp.selectedPersonas}
                objective={exp.objective}
                onApplyVariant={(newCap) => {
                  exp.setCaption(newCap);
                  exp.backToStudio();
                }}
              />
            )}

            {/* 3. Feature C: Cross-Platform Compatibility Matrix */}
            {(activeDeckTab === 'all' || activeDeckTab === 'matrix') && (
              <CrossPlatformMatrix
                caption={exp.caption}
                transcript={exp.transcript}
                currentPlatform={exp.platform}
                mediaType={exp.mediaType}
                selectedPersonas={exp.selectedPersonas}
                objective={exp.objective}
                onSelectPlatform={(newPlat) => {
                  exp.setPlatform(newPlat);
                  exp.backToStudio();
                }}
                onApplyAdaptedSpecimen={(newPlat, adaptedCaption) => {
                  exp.setPlatform(newPlat);
                  exp.setCaption(adaptedCaption);
                  exp.backToStudio();
                }}
              />
            )}

            {/* 4. Genetic Candidate Optimizer */}
            {(activeDeckTab === 'all' || activeDeckTab === 'optimizer') && (
              <>
                {result.optimization && result.score && (
                  <BeforeAfterStory
                    originalScore={result.score}
                    optimizedScore={result.best_score}
                    optimization={result.optimization}
                  />
                )}

                {result.optimization && (
                  <OptimizationSection
                    optimization={result.optimization}
                    onApplyWinner={exp.applyWinner}
                  />
                )}
              </>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 pb-8">
              <Button
                variant="viral"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={exp.backToStudio}
              >
                ← BACK TO STUDIO / EDIT SPECIMEN
              </Button>
              <Button
                variant="outline"
                size="md"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={exp.resetExperiment}
              >
                CLEAR & START NEW SPECIMEN
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Audit Log Drawer */}
      <HistoryDrawer
        isOpen={exp.isHistoryOpen}
        onClose={() => exp.setIsHistoryOpen(false)}
        runs={exp.history}
        onSelectRun={exp.loadPastRun}
      />

      {/* Laboratory Editorial Footer */}
      <footer className="w-full border-t border-[#00FF41]/20 py-4 font-mono-tech text-[10px] text-[#526355] uppercase tracking-wider bg-[#000000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#8E9E90]">VIRALITY LAB // MULTI-AGENT CONTENT INTELLIGENCE INSTRUMENT</span>
          <span className="text-[#00FF41]">DETERMINISTIC SIMULATION ENGINE · FASTAPI + REACT</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
