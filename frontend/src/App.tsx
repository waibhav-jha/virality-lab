import React, { useRef } from 'react';
import {
  AlertCircle,
  Beaker,
  RotateCcw,
  X,
  ArrowRight,
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
import { ViralityScoreSection } from './features/scoring/ViralityScoreSection';
import { DiagnosticsSection } from './features/scoring/DiagnosticsSection';
import { OptimizationSection } from './features/optimization/OptimizationSection';
import { BeforeAfterStory } from './features/optimization/BeforeAfterStory';
import { Button } from './design-system/Button';

export function App() {
  const exp = useExperiment();
  const { result } = exp;
  const resultsRef = useRef<HTMLDivElement>(null);

  const isSimulating = exp.status === 'running';
  const hasResults = !!result;

  const handleStart = async () => {
    await exp.startSimulation();
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  const handleDemo = () => {
    exp.runDemoSimulation();
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F4F6F8] flex flex-col relative overflow-x-hidden contour-grid-bg selection:bg-[#D4FF00] selection:text-[#07080A]">
      {/* Header Masthead */}
      <Header
        health={exp.health}
        historyCount={exp.history.length}
        onOpenHistory={() => exp.setIsHistoryOpen(true)}
        onReset={exp.resetExperiment}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8" role="main">
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
            <div className="lg:col-span-7 bg-[#0E1013] border border-white/15 p-5 sm:p-7 corner-ticks flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono-tech text-[10px] text-[#7E8798] uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="text-[#D4FF00] font-bold">01 // PARAMETERS</span>
                  <span>::</span>
                  <span className="text-white font-bold">SPECIMEN & AUDIENCE CONFIGURATION</span>
                </div>
                <span>CONFIG MODE</span>
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
                  className="w-full"
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
                <div className="flex items-center justify-between font-mono-tech text-[9px] text-[#5B6474] px-1 uppercase">
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
            {/* 1. Virality Potential Score Master Deck */}
            {result.score && (
              <ViralityScoreSection
                score={result.score}
                optimizedScore={result.best_score || undefined}
              />
            )}

            {/* 2. Content Diagnostics & Root-Cause Matrix */}
            {result.score && (
              <DiagnosticsSection
                score={result.score}
                contentProfile={result.content_profile}
              />
            )}

            {/* 3. Ranked Audience Response Spectrum */}
            {result.simulation?.reactions && (
              <AudienceMap
                reactions={result.simulation.reactions}
                totalPersonas={result.simulation.total_personas}
                completedPersonas={result.simulation.completed_personas}
              />
            )}

            {/* 4. Per-Persona Granular Dossier Ledger */}
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

            {/* 4C. Synthetic Social Feed & Persona Comment Debate Stream */}
            {result.simulation?.reactions && (
              <PersonaDebateStream
                reactions={result.simulation.reactions}
                caption={exp.caption}
                platform={exp.platform}
              />
            )}

            {/* 5. Before/After Story & Optimization Lift */}
            {result.optimization && result.score && (
              <BeforeAfterStory
                originalScore={result.score}
                optimizedScore={result.best_score}
                optimization={result.optimization}
              />
            )}

            {/* 6. Candidate Variant Comparison Workbench */}
            {result.optimization && (
              <OptimizationSection
                optimization={result.optimization}
                onApplyWinner={exp.applyWinner}
              />
            )}

            {/* Reset / New Specimen Trigger */}
            <div className="flex items-center justify-center gap-3 pt-4 pb-8">
              <Button variant="outline" size="md" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={exp.resetExperiment}>
                INITIATE NEW SPECIMEN EXPERIMENT
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VIRALITY LAB // MULTI-AGENT CONTENT INTELLIGENCE INSTRUMENT</span>
          <span className="text-[#7E8798]">DETERMINISTIC SIMULATION ENGINE · FASTAPI + REACT</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
