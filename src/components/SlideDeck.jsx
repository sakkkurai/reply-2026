import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import SlideScore from './slides/SlideScore';
import SlideHourPeek from './slides/SlideHourPeek';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UNCOMPLETED_HINT } from '../constants/strings';
import SlideStreak from './slides/SlideStreak';
import SlideTopWords from './slides/SlideTopWords';

const SLIDE_COMPONENTS = {
    1: SlideScore,
    2: SlideHourPeek,
    3: SlideStreak,
    4: SlideTopWords,
};

function ProgressBars({ total, current }) {
    return (
        <div className="fixed top-4 left-4 right-4 flex gap-1 z-50">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className="flex-1 h-1 rounded-full bg-text/20 overflow-hidden"
                >
                    <div
                        className={`h-full bg-text transition-all duration-300 ${i <= current - 1 ? 'w-full' : 'w-0'
                            }`}
                    />
                </div>
            ))}
        </div>
    );
}

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction > 0 ? -80 : 80,
        opacity: 0,
    }),
};

function SlideDeck() {
    const { id } = useParams();
    const navigate = useNavigate();
    const slideId = Number(id);

    const TOTAL_SLIDES = Object.keys(SLIDE_COMPONENTS).length;

    const [completed, setCompleted] = useState({});
    const [showHint, setShowHint] = useState(false);
    const isCurrentComplete = completed[slideId] ?? false;
    const hintTimeoutRef = useRef(null);
    const directionRef = useRef(1);

    const triggerHint = () => {
        setShowHint(true);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = setTimeout(() => setShowHint(false), 1200);
    };

    const goNext = () => {
        if (!isCurrentComplete) {
            triggerHint();
            return;
        }
        if (slideId < TOTAL_SLIDES) {
            directionRef.current = 1;
            navigate(`/slide/${slideId + 1}`);
        }
    };
    const goPrev = () => {
        if (slideId > 1) {
            directionRef.current = -1;
            navigate(`/slide/${slideId - 1}`);
        }
    };

    const swipeHandlers = useSwipeable({
        onSwipedLeft: goNext,
        onSwipedRight: goPrev,
        preventScrollOnSwipe: true,
        trackMouse: false,
        delta: 50,
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slideId, isCurrentComplete]);

    const handleTapZone = (e) => {
        if (e.target.closest('button, a, input, [data-no-tap-nav]')) return;

        const isRightHalf = e.clientX > window.innerWidth / 2;
        isRightHalf ? goNext() : goPrev();
    };


    const SlideComponent = SLIDE_COMPONENTS[slideId];

    if (!SlideComponent) {
        return <p>Слайд не найден!</p>;
    }

    const markComplete = (data) => {
        setCompleted((prev) => ({ ...prev, [slideId]: data ?? true }));
    };

    return (
        <div {...swipeHandlers} onClick={handleTapZone} className="min-h-screen">
            <ProgressBars total={TOTAL_SLIDES} current={slideId} />
            <AnimatePresence mode="wait" custom={directionRef.current}>
                <motion.div
                    key={slideId}
                    custom={directionRef.current}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                    <SlideComponent
                        onComplete={markComplete}
                        completedData={completed[slideId]}
                        goNext={goNext}
                    />
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {showHint && (
                    <motion.div
                        key="hint"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-text text-bg px-5 py-2 rounded-full text-sm z-50"
                    >
                        {UNCOMPLETED_HINT}
                    </motion.div>
                )}
            </AnimatePresence>

            {isCurrentComplete && slideId < TOTAL_SLIDES && (
                <motion.div
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="fixed right-4 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none"
                >
                    →
                </motion.div>
            )}
        </div>
    );
}

export default SlideDeck;
