import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, BUTTON_ACCENT, Text, Title } from '../ui/Typography';
import metrics from '../../constants/metrics.json';
import {
    WHOMISSMORE_TITLE,
    WHOMISSMORE_BUTTON_START,
    WHOMISSMORE_CAPTION,
    WHOMISSMORE_RESULT,
    WHOMISSMORE_NEXT,
} from '../../constants/strings';

function formatSeconds(sec) {
    if (sec == null) return '—';
    if (sec < 60) return `${Math.round(sec)} сек`;
    const min = Math.round(sec / 60);
    return `${min} мин`;
}

export default function SlideWhoMissesMore({ onComplete, completedData, goNext }) {
    const {
        initiations_me,
        initiations_her,
        initiates_more,
        median_response_seconds_me,
        median_response_seconds_her,
    } = metrics.who_misses_more;

    const total = initiations_me + initiations_her;
    const herPct = Math.round((initiations_her / total) * 100);
    const mePct = 100 - herPct;

    const [phase, setPhase] = useState(completedData ? 'done' : 'idle');

    const handleStart = () => setPhase('filling');

    useEffect(() => {
        if (phase === 'filling') {
            const t = setTimeout(() => setPhase('done'), 1400);
            return () => clearTimeout(t);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'done') onComplete?.(true);
    }, [phase]);

    return (
        <motion.div layout="position" className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-10 " >
            <motion.div layout>
                <Title className="text-2xl">{WHOMISSMORE_TITLE}</Title>

            </motion.div>

            <motion.div layout className="relative w-full max-w-md h-16 rounded-full bg-bg-alt overflow-hidden">
                <motion.div
                    className="absolute left-0 top-0 h-full bg-accent-peach"
                    initial={{ width: '0%' }}
                    animate={{ width: phase === 'idle' ? '0%' : '100%' }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                />

                <motion.div
                    className="absolute right-0 top-0 h-full bg-text"
                    initial={{ width: '0%' }}
                    animate={{ width: phase === 'idle' ? '0%' : `${mePct}%` }}
                    transition={{ duration: 1.0, delay: 0.8, ease: 'easeInOut' }}
                />

                {phase === 'done' && (
                    <>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 font-bold"
                        >
                            {herPct}%
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-bg font-bold"
                        >
                            {mePct}%
                        </motion.span>
                    </>
                )}
            </motion.div>

            <motion.div layout className="min-h-[160px] flex items-center justify-center">
                <AnimatePresence>
                    {phase === 'idle' && (
                        <motion.div
                            key="start-btn"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button data-no-tap-nav state={BUTTON_ACCENT} onClick={handleStart}>
                                {WHOMISSMORE_BUTTON_START}
                            </Button>
                        </motion.div>
                    )}

                    {phase === 'done' && (
                        <motion.div
                            layout
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3, duration: 0.5 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <Text className="text-2xl">
                                {WHOMISSMORE_RESULT(initiates_more === 'her' ? 'Ксюша' : 'Миша', initiates_more === 'her' ? 'первой' : 'первым')}
                            </Text>
                            <Text className="text-xl">
                                {WHOMISSMORE_CAPTION(
                                    formatSeconds(median_response_seconds_me),
                                    formatSeconds(median_response_seconds_her)
                                )}
                            </Text>
                            <Button data-no-tap-nav state={BUTTON_ACCENT} onClick={goNext}>
                                {WHOMISSMORE_NEXT}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
