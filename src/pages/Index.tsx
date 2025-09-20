import React, { useState } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { AdvancedClayStudio } from '@/components/AdvancedClayStudio';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStart = () => {
    setShowWelcome(false);
  };

  return (
    <ErrorBoundary>
      {showWelcome ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <AdvancedClayStudio />
      )}
    </ErrorBoundary>
  );
};

export default Index;
