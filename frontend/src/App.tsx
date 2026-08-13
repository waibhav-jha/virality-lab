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
  const exp = useExperiment();
  const { result } = exp;
  const resultsRef = useRef<HTMLDivElement>(null);
  const [activeDeckTab, setActiveDeckTab] = useState<'all' | 'audit' | 'ab_arena' | 'matrix' | 'optimizer'>('all');

  // View state: 'landing' or 'studio' based on hash or default entry
  const getInitialView = (): 'landing' | 'studio' => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('studio') || hash.includes('app')) {
        return 'studio';
      }
    }
    return 'landing';
  };

  const [currentView, setCurrentView] = useState<'landing' | 'studio'>(getInitialView);

  // Synchronize hash changes (e.g. browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('studio') || hash.includes('app')) {
        setCurrentView('studio');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Launch Studio action (optionally injecting a prompt preset)
  const handleLaunchStudio = (presetPrompt?: string) => {
    if (presetPrompt) {
      exp.setCaption(presetPrompt);
    }
    window.location.hash = 'studio';
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to Landing Portal action
  const handleNavigateToLanding = () => {
    window.location.hash = '';
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automatically reset to 'all' modules whenever a new run or rerun starts or results arrive
  useEffect(() => {
    if (exp.status === 'running' || exp.result) {
      setActiveDeckTab('all');
    }
  }, [exp.currentRunId, exp.status]);

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

  // Render Landing Page as Default Primary View
  if (currentView === 'landing') {
    return <LandingPage onLaunchStudio={handleLaunchStudio} />;
  }

  // Render Full Virality Lab Simulation Studio
  return (
    <div className="min-h-screen bg-[#07080A] text-[#F4F6F8] flex flex-col relative overflow-x-hidden contour-grid-bg selection:bg-[#D4FF00] selection:text-[#07080A]">
      {/* Header Masthead */}
      <Header
        health={exp.health}
        historyCount={exp.history.length}
        showBack={hasResults}
        onBackToStudio={exp.backToStudio}
        onNavigateToLanding={handleNavigateToLanding}
        onOpenHistory={() => exp.setIsHistoryOpen(true)}
        onReset={exp.resetExperiment}
      />

      {/* Main Studio Content Area - Expanded to max-w-[1640px] to eliminate empty side voids */}
      <main className="flex-1 w-full max-w-[1640px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 flex flex-col gap-8" role="main">
        {/* Editorial Inquiry & Specimen Presets */}
        <HeroSection onLoadSample={exp.loadSample} onRunDemo={handleDemo} />

        {/* Error Alert Bar */}
        {exp.error && (
          <div
            className="w-full bg-[#0E1013] border border-red-500/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left font-mono-tech"
            role="alert"
          >
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase">
                  {exp.status === 'failed' ? 'EXECUTION FAILURE // RUN INTERRUPTED' : 'SYSTEM EXCEPTION ENCOUNTERED'}
                </span>
                <span className="text-xs text-red-300/90 font-sans">{exp.error}</span>
                <span className="text-[10px] text-[#7E8798]">
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
          <div className="w-full bg-white/[0.02] border border-[#D4FF00]/40 p-3 flex items-center justify-between text-xs font-mono-tech text-[#D4FF00]" role="status">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">[ DEMO BENCHMARK DATASET ]</span>
              <span className="text-white/40">·</span>
              <span className="text-[#9DA7B8] font-sans">Pre-calibrated baseline specimen for instant interface exploration.</span>
            </div>
            <button onClick={exp.resetExperiment} className="font-bold text-white hover:text-[#D4FF00] cursor-pointer underline uppercase text-[11px]">
              EXIT DEMO
            </button>
          </div>
        )}

        {/* ───── Studio: Content & Parameter Configuration ───── */}
        {exp.phase === 'setup' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" aria-label="Content workspace">
            {/* Left 7 Cols: Experiment Parameter Controls */}
            <div className="lg:col-span-7 cyber-card corner-ticks p-5 sm:p-7 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b-2 border-white/15 pb-3 font-mechanismo text-[11px] text-[#8E98AA] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="text-[#D4FF00] font-black bg-[#D4FF00]/10 px-1.5 py-0.5 border border-[#D4FF00]/40">01 // PARAMETERS</span>
                  <span className="text-white/40">::</span>
                  <span className="text-white font-bold">SPECIMEN & AUDIENCE CONFIGURATION</span>
                </div>
                <span className="bg-[#07080A] px-2 py-0.5 border border-white/15 text-[#00F0FF] font-bold text-[10px]">CONFIG MODE</span>
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
                <div className="flex items-center justify-between font-mechanismo text-[10px] text-[#646E82] px-1 uppercase font-bold">
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

        {/* Pipeline Telemetry Progress */}
        {isSimulating && (
          <div ref={resultsRef} className="w-full">
            <SimulationProgress
              status={exp.status} stage={exp.stage} progress={exp.progress}
              message={exp.message} runId={exp.currentRunId}
            />
          </div>
        )}

        {/* ───── Results Section ───── */}
        {hasResults && result && (
          <div ref={resultsRef} className="w-full flex flex-col gap-8 pt-2" aria-label="Simulation results">
            {/* Top Quick Navigation Bar */}
            <div className="w-full cyber-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 corner-ticks">
              <div className="flex items-center gap-3 font-mechanismo">
                <Button
                  variant="viral"
                  size="sm"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={exp.backToStudio}
                  className="font-csmigrate font-black tracking-wider text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  ← BACK TO STUDIO / EDIT SPECIMEN
                </Button>
                <span className="hidden sm:inline-block w-px h-5 bg-white/20" />
                <span className="text-xs text-[#8E98AA] uppercase font-bold">
                  PLATFORM: <span className="text-white font-black">{exp.platform.toUpperCase()}</span> ·{' '}
                  <span className="text-[#D4FF00] font-black">{result.score?.performance_tier || 'COMPLETED'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={exp.resetExperiment}
                  className="font-csmigrate text-xs"
                >
                  CLEAR ALL
                </Button>
              </div>
            </div>

            {/* Sub-Module Navigation Switcher */}
            <div className="w-full flex flex-wrap items-center gap-2 border-b-2 border-white/15 pb-3 font-mechanismo text-xs">
              <span className="text-[#8E98AA] text-[10px] uppercase font-bold mr-2">LAB MODULE:</span>
              
              <button
                type="button"
                onClick={() => setActiveDeckTab('all')}
                className={`px-3 py-1.5 uppercase font-black font-csmigrate border-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                  activeDeckTab === 'all'
                    ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00]'
                    : 'bg-[#07080A] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
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
                    ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00]'
                    : 'bg-[#07080A] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
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
                    ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00]'
                    : 'bg-[#07080A] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
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
                    ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00]'
                    : 'bg-[#07080A] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
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
                    ? 'bg-[#D4FF00] text-[#060709] border-[#D4FF00]'
                    : 'bg-[#07080A] text-[#8E98AA] border-white/15 hover:text-white hover:border-white/30'
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
                    <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2 font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <span className="text-[#D4FF00] font-bold">04B // PERSONA DOSSIERS</span>
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
      <footer className="w-full border-t border-white/10 py-4 font-mono-tech text-[10px] text-[#5B6474] uppercase tracking-wider">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VIRALITY LAB // MULTI-AGENT CONTENT INTELLIGENCE INSTRUMENT</span>
          <span className="text-[#7E8798]">DETERMINISTIC SIMULATION ENGINE · FASTAPI + REACT</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
