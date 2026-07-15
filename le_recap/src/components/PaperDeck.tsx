// src/components/PaperDeck.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import html2canvas from 'html2canvas';
import pageImage from '../assets/page.png';

const JERSEY_FONT = "'Jersey 10', sans-serif";

interface CardData {
  id: string | number;
  content: string[];
}

interface PaperDeckProps {
  cards: CardData[];
}

export const PaperDeck: React.FC<PaperDeckProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  // 1. This ref now points to our off-screen, perfectly flat twin card!
  const flatMirrorRef = useRef<HTMLDivElement>(null);

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex >= 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const halfWidth = window.innerWidth / 2;
    if (e.clientX > halfWidth) {
      nextCard();
    } else {
      prevCard();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  const handleShareRecap = async () => {
    if (!flatMirrorRef.current) return;

    setShareStatus('copying');

    try {
      // 2. Snap the off-screen flat mirror card instead of the rotated active card
      const canvas = await html2canvas(flatMirrorRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create blob');

        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);

          setShareStatus('success');
          setTimeout(() => setShareStatus('idle'), 2500);
        } catch (clipboardError) {
          console.error('Clipboard permission denied:', clipboardError);
          setShareStatus('error');
          setTimeout(() => setShareStatus('idle'), 2500);
        }
      }, 'image/png');

    } catch (error) {
      console.error('Failed to capture card snapshot:', error);
      setShareStatus('error');
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  };

  const lastCardData = cards[cards.length - 1];

  return (
    <div 
      onClick={handleScreenClick}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'hsl(180, 14%, 31%)',
        cursor: 'pointer',
      }}
    >
      {/* 3. THE SECRET FLAT TWIN (Hidden way off-screen, completely unrotated) */}
      {lastCardData && (
        <div
          ref={flatMirrorRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '400px',  // Match your exact on-screen card dimensions
            height: '550px',
            backgroundImage: `url(${pageImage.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0px 10px 25px rgba(0,0,0,0.35)',
            padding: '40px 30px 40px 65px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <div 
            style={{
              fontFamily: JERSEY_FONT,
              fontSize: '28px',
              color: '#1a1a1a',
              lineHeight: '1.45',
              letterSpacing: '0.5px',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
            }}
          >
            {lastCardData.content.map((line, i) => (
              <div key={i} style={{ minHeight: '32px' }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(new Event('go-back-to-landing'));
        }}
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          fontFamily: JERSEY_FONT,
          fontSize: '24px',
          padding: '8px 16px',
          background: '#FFE066',
          border: '3px solid #000',
          cursor: 'pointer',
          boxShadow: '4px 4px 0px #000',
          zIndex: cards.length + 20,
          transition: 'transform 0.1s ease',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(2px, 2px)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
      >
        ← BACK
      </button>

      {/* Navigation Hints */}
      <div style={{ position: 'absolute', left: '20px', bottom: '20px', color: '#fff', opacity: 0.4, fontFamily: JERSEY_FONT, fontSize: '20px', pointerEvents: 'none' }}>
        {currentIndex >= 0 ? '← Click Left / Arrow Left' : ''}
      </div>
      <div style={{ position: 'absolute', right: '20px', bottom: '20px', color: '#fff', opacity: 0.4, fontFamily: JERSEY_FONT, fontSize: '20px', pointerEvents: 'none' }}>
        {currentIndex < cards.length - 1 ? 'Click Right / Arrow Right →' : 'Done!'}
      </div>

      <div style={{ position: 'relative', width: '400px', height: '550px' }} onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="popLayout">
          {currentIndex === -1 ? (
            <motion.div
              key="intro-text"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                width: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                textAlign: 'center',
                fontFamily: JERSEY_FONT,
                fontSize: '36px',
                color: '#fff',
                textShadow: '2px 2px 0px #000',
                pointerEvents: 'none',
              }}
            >
              Click to view your recap!
            </motion.div>
          ) : (
            cards.slice(0, currentIndex + 1).map((card, index) => (
              <PaperSheet 
                key={card.id} 
                content={card.content} 
                index={index} 
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Share / Copy Button */}
      {currentIndex === cards.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShareRecap();
          }}
          disabled={shareStatus === 'copying'}
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '100px',
            fontFamily: JERSEY_FONT,
            fontSize: '24px',
            padding: '10px 24px',
            background: shareStatus === 'success' ? '#86EFAC' : '#FFE066',
            border: '3px solid #000',
            cursor: shareStatus === 'copying' ? 'not-allowed' : 'pointer',
            boxShadow: '4px 4px 0px #000',
            zIndex: cards.length + 10,
            transition: 'background 0.2s ease',
          }}
        >
          {shareStatus === 'idle' && 'SHARE RECAP'}
          {shareStatus === 'copying' && 'GENERATING...'}
          {shareStatus === 'success' && 'COPIED IMAGE!'}
          {shareStatus === 'error' && 'FAILED TO COPY :('}
        </button>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Individual Stacking Paper Sheet ---

interface PaperSheetProps {
  content: string[];
  index: number;
}

const PaperSheet: React.FC<PaperSheetProps> = ({ content, index }) => {
  const randomRotation = React.useMemo(() => {
    const seed = (index + 1) * 153.7;
    return Math.sin(seed) * 6;
  }, [index]);

  const dropVariants: Variants = {
    initial: {
      y: -800,
      opacity: 1,
      rotate: 0,
      scale: 1.05,
    },
    animate: {
      y: 0,
      opacity: 1,
      rotate: randomRotation,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 65,
        damping: 18,
        mass: 1.1,
      },
    },
    exit: {
      y: -800,
      opacity: 1,
      rotate: 0,
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 18,
      }
    }
  };

  return (
    <motion.div
      variants={dropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: index,
        backgroundImage: `url(${pageImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0px 10px 25px rgba(0,0,0,0.35), 0px 4px 10px rgba(0,0,0,0.2)',
        padding: '40px 30px 40px 65px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <div 
        style={{
          fontFamily: JERSEY_FONT,
          fontSize: '28px',
          color: '#1a1a1a',
          lineHeight: '1.45',
          letterSpacing: '0.5px',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
        }}
      >
        {content.map((line, i) => (
          <div key={i} style={{ minHeight: '32px' }}>
            {line}
          </div>
        ))}
      </div>
    </motion.div>
  );
};