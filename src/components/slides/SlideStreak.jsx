import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Button, BUTTON_ACCENT, Text, Title } from '../ui/Typography';
import metrics from '../../constants/metrics.json';
import { STREAK_BUTTON_NEXT, STREAK_CAPTION, STREAK_DAYS_LONGEST, STREAK_TITLE } from '../../constants/strings';

export default function SlideStreak({ onComplete, goNext, completedData }) {
    const { longest_streak_days, longest_pause_hours, longest_pause_broken_by, longest_pause_start, longest_pause_end } = metrics.streak;
    const [count, setCount] = useState(completedData ? longest_streak_days : 0);
    const [done, setDone] = useState(Boolean(completedData));


    useEffect(() => {
        if (completedData) return;

        const duration = 1800;
        const steps = 60;
        const stepTime = duration / steps;
        let current = 0;

        const interval = setInterval(() => {
            current += 1;
            const progress = current / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * longest_streak_days));

            if (current >= steps) {
                clearInterval(interval);
                setCount(longest_streak_days);
                setDone(true);
                onComplete?.(true);
            }
        }, stepTime);

        return () => clearInterval(interval);
    }, []);

    const brightness = count / longest_streak_days;

    const MONTHS_GENITIVE = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
    ];

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        const day = date.getDate();
        const month = MONTHS_GENITIVE[date.getMonth()];
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}-го ${month}, ${hours}:${minutes}`;
    };

    return (
        <motion.div layout className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <Title className="text-2xl pb-8">{STREAK_TITLE}</Title>

            <motion.div layout initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }} className="flex items-center gap-4">
                <motion.div
                    layout
                    animate={{
                        scale: done ? [1 + brightness * 0.3, 1.15, 1 + brightness * 0.3] : 1 + brightness * 0.3,
                        filter: `drop-shadow(0 0 ${brightness * 20}px var(--color-streak-outline))`,
                    }}
                    transition={
                        done
                            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.1 }
                    }
                >
                    <Flame
                        size={64}
                        fill={brightness > 0.5 ? 'var(--color-streak-outline)' : 'none'}
                        className="text-streak"
                    />
                </motion.div>

                <motion.div
                    animate={done ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4 }}
                >
                    <Text className="text-8xl tabular-nums">{count}</Text>
                </motion.div>
            </motion.div>

            <motion.div layout>
                <Text className="text-2xl mt-4">{STREAK_DAYS_LONGEST}</Text>

            </motion.div>
            {done && (
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-10 flex flex-col items-center gap-8"
                >
                    <Button data-no-tap-nav state={BUTTON_ACCENT} onClick={goNext}>
                        {STREAK_BUTTON_NEXT}
                    </Button>

                    <Text className="text-xl">
                        {STREAK_CAPTION(longest_pause_hours, formatDateTime(longest_pause_start), formatDateTime(longest_pause_end), longest_pause_broken_by)}
                    </Text>
                </motion.div>
            )}
        </motion.div>
    );
}
