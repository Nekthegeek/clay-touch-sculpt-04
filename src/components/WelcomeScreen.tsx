import React from 'react';
import { Play, Smartphone, Download, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-canvas flex flex-col items-center justify-center p-6 text-center">
      {/* Logo/Icon with Enhanced Styling */}
      <div className="mb-8 relative">
        <div className="w-28 h-28 bg-gradient-clay rounded-3xl flex items-center justify-center shadow-glow animate-float">
          <Palette className="h-14 w-14 text-white drop-shadow-lg" />
        </div>
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-full animate-glow shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Enhanced Title */}
      <h1 className="text-hero mb-6 text-center">
        ClayPlay 3D
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl text-center leading-relaxed">
        Sculpt virtual clay with your fingers and export for 3D printing — the perfect creative tool for makers and artists
      </p>

      {/* Enhanced Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl">
        <div className="floating-panel-sm text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:shadow-lg transition-shadow">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-display text-lg mb-3">Touch Sculpting</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Intuitive finger gestures for push, pull, smooth, and pinch — sculpt naturally with multitouch controls
          </p>
        </div>

        <div className="floating-panel-sm text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-hover rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:shadow-lg transition-shadow">
            <Download className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-display text-lg mb-3">STL Export</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One-tap export ready for 3D printing — compatible with all major slicing software
          </p>
        </div>

        <div className="floating-panel-sm text-center group hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-clay-brown to-clay-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow group-hover:shadow-lg transition-shadow">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-display text-lg mb-3">Mobile First</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Optimized for tablets and mobile browsers with responsive touch controls
          </p>
        </div>
      </div>

      {/* Enhanced CTA Button */}
      <Button
        size="lg"
        className="btn-clay text-lg px-10 py-7 h-auto rounded-3xl group shadow-glow hover:shadow-xl transition-all duration-500"
        onClick={onStart}
      >
        <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
        <span className="text-display">Start Sculpting</span>
      </Button>

      <p className="text-sm text-muted-foreground mt-8 opacity-80">
        Perfect for makers, hobbyists, and 3D printing enthusiasts
      </p>
    </div>
  );
};