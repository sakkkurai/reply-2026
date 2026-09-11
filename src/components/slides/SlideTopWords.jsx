import { motion, AnimatePresence } from 'framer-motion';
import { Button, BUTTON_ACCENT, Text, Title } from '../ui/Typography';
import {
    DndContext,
    useDraggable,
    useDroppable,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { TOPWORDS_BUTTON_INTRO_NEXT, TOPWORDS_DESCRIPTION, TOPWORDS_TITLE, TOPWORDS_CORRECT, TOPWORDS_FINAL, TOPWORDS_ME_LABEL, TOPWORDS_HER_LABEL, TOPWORDS_WRONG, TOPWORDS_NEXT, TOPWORDS_FINAL_RESULT } from '../../constants/strings';
import { useState, useMemo, useEffect } from 'react';
import metrics from '../../constants/metrics.json';
import cat from '../../assets/cat.jpg'


export default function SlideTopWords({ onComplete, completedData, goNext }) {
    const gameWords = useMemo(buildGameWords, []);
    const [started, setStarted] = useState(Boolean(completedData));
    const [index, setIndex] = useState(completedData ? gameWords.length : 0);
    const [score, setScore] = useState(completedData?.score ?? 0);
    const [feedback, setFeedback] = useState(null);
    const [zoneFlash, setZoneFlash] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
    );

    const currentWord = gameWords[index];
    const finished = index >= gameWords.length;

    const handleDragEnd = (event) => {
        const { over } = event;
        if (!over || !currentWord) return;

        const isCorrect = over.id === currentWord.answer;
        setZoneFlash({ zone: over.id, type: isCorrect ? 'correct' : 'wrong' });
        setFeedback(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) setScore((s) => s + 1);

        setTimeout(() => {
            setZoneFlash(null);
            setFeedback(null);
            setIndex((i) => i + 1);
        }, 600);
    };

    const handleFinish = () => {
        onComplete?.({ score });
    };

    useEffect(() => {
        if (finished) handleFinish();
    }, [finished])

    if (!started) {
        return (
            <motion.div layout className="min-h-screen flex flex-col items-center justify-center text-center">
                <Title>{TOPWORDS_TITLE}</Title>
                <Text className="mx-32">{TOPWORDS_DESCRIPTION}</Text>
                <Button
                    data-no-tap-nav
                    state={BUTTON_ACCENT}
                    className="mt-8"
                    onClick={() => setStarted(true)}
                >
                    {TOPWORDS_BUTTON_INTRO_NEXT}
                </Button>
            </motion.div>
        );
    }

    if (finished) {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen flex flex-col items-center justify-center text-center px-6"
            >
                <Text className="text-8xl">{TOPWORDS_FINAL_RESULT(score, gameWords.length)}</Text>
                <img src={cat} className='w-64 h-64 rounded-4xl mt-8' />
                <Text className="text-2xl mt-4">{TOPWORDS_FINAL}</Text>
                <Button data-no-tap-nav state={BUTTON_ACCENT} className="mt-10" onClick={goNext}>
                    {TOPWORDS_NEXT}
                </Button>
            </motion.div>
        );
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-16">
                <div className="flex flex-col items-center gap-4">
                    <Text className="text-sm opacity-60">
                        {index + 1} / {gameWords.length}
                    </Text>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentWord.word}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.25 }}
                        >
                            <DraggableWord word={currentWord.word} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex gap-6 w-full max-w-xl">
                    <DropZone
                        id="me"
                        label={TOPWORDS_ME_LABEL}
                        feedback={zoneFlash?.zone === 'me' ? zoneFlash.type : null}
                    />
                    <DropZone
                        id="her"
                        label={TOPWORDS_HER_LABEL}
                        feedback={zoneFlash?.zone === 'her' ? zoneFlash.type : null}
                    />
                </div>

                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="fixed bottom-16 text-xl"
                        >
                            {feedback === 'correct' ? TOPWORDS_CORRECT : TOPWORDS_WRONG}
                        </motion.div>
                    )}
                    {import.meta.env.DEV && (
                        <button
                            onClick={() => setIndex(gameWords.length)}
                            className="fixed top-20 right-4 text-xs opacity-50 z-50"
                        >
                            [dev] skip
                        </button>
                    )}
                </AnimatePresence>
            </div>
        </DndContext>
    );
}


function buildGameWords() {
    const meMap = new Map(metrics.top_words.me);
    const herMap = new Map(metrics.top_words.her);

    const meUnique = [...meMap.keys()].filter((w) => !herMap.has(w));
    const herUnique = [...herMap.keys()].filter((w) => !meMap.has(w));

    const words = [
        ...meUnique.map((w) => ({ word: w, answer: 'me' })),
        ...herUnique.map((w) => ({ word: w, answer: 'her' })),
    ];

    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }

    return words;
}

function DraggableWord({ word }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: 'current-word',
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            zIndex: 50,
        }
        : undefined;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            data-no-tap-nav
            className={`font-script-caveat px-8 py-4 rounded-full bg-text text-bg text-2xl cursor-grab active:cursor-grabbing select-none touch-none ${isDragging ? 'opacity-80' : ''
                }`}
            animate={{ scale: isDragging ? 1.08 : 1 }}
        >
            {word}
        </motion.div>
    );
}

function DropZone({ id, label, feedback }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            data-no-tap-nav
            className={`flex-1 h-40 rounded-3xl border-2 border-dashed flex items-center justify-center transition-colors ${isOver ? 'border-text bg-bg-alt' : 'border-text/30'
                } ${feedback === 'correct' ? '!bg-accent-mint/60 !border-accent-mint' : ''
                } ${feedback === 'wrong' ? '!bg-accent-peach/60 !border-accent-peach' : ''
                }`}
        >
            <Text className="text-xl">{label}</Text>
        </div>
    );
}


