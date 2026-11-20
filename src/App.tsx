import React, { useEffect } from 'react';
import { useAquariumStore } from './store/aquariumStore';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { AquariumView } from './components/AquariumView';
import { FeedPanel } from './components/FeedPanel';
import { LightingPanel } from './components/LightingPanel';
import { TankBuilderPanel } from './components/TankBuilderPanel';
import { SpeciesLibraryPanel } from './components/SpeciesLibraryPanel';
import { EquipmentPanel } from './components/EquipmentPanel';
import { AquascapePanel } from './components/AquascapePanel';
import { SaveManagerModal } from './components/SaveManagerModal';
import { WatchModeExit } from './components/WatchModeExit';

export const App: React.FC = () => {
  const {
    activePanel,
    setActivePanel,
    isWatchMode,
    toggleWatchMode,
    toggleAudio,
    statusMessage,
    setStatusMessage
  } = useAquariumStore();

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        if (isWatchMode) {
          toggleWatchMode(false);
        } else if (activePanel) {
          setActivePanel(null);
        }
      } else if (e.key === 'w' || e.key === 'W') {
        toggleWatchMode();
      } else if (e.key === 'f' || e.key === 'F') {
        setActivePanel(activePanel === 'feed' ? null : 'feed');
      } else if (e.key === 'l' || e.key === 'L') {
        setActivePanel(activePanel === 'lighting' ? null : 'lighting');
      } else if (e.key === 'm' || e.key === 'M') {
        toggleAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePanel, isWatchMode, setActivePanel, toggleWatchMode, toggleAudio]);

  // Clear status toast after 4 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage, setStatusMessage]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-aqua-950 flex flex-col font-sans select-none">
      {/* Top Header */}
      <Header />

      {/* Main 2.5D Living Aquarium Canvas */}
      <main className="relative flex-1 w-full h-full min-h-0 flex flex-col overflow-hidden">
        <AquariumView />

        {/* Transient Status Toast */}
        {statusMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-aqua-900/90 border border-cyan-400/50 shadow-aqua-glow backdrop-blur-md text-white text-xs font-semibold z-40 animate-in fade-in slide-in-from-top-2">
            {statusMessage}
          </div>
        )}
      </main>

      {/* Bottom Main Navigation Toolbar */}
      <Toolbar />

      {/* Discreet Watch Mode Exit Pill */}
      <WatchModeExit />

      {/* Modals & Panels */}
      {activePanel === 'feed' && <FeedPanel />}
      {activePanel === 'lighting' && <LightingPanel />}
      {activePanel === 'tank_builder' && <TankBuilderPanel />}
      {activePanel === 'species' && <SpeciesLibraryPanel />}
      {activePanel === 'equipment' && <EquipmentPanel />}
      {activePanel === 'aquascape' && <AquascapePanel />}
      {activePanel === 'save_manager' && <SaveManagerModal />}
    </div>
  );
};

export default App;
