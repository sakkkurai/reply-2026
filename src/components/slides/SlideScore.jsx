import { TOTAL_BUTTON_NEXT, TOTAL_DESCIRPTION, TOTAL_ETC, TOTAL_ME, TOTAL_MERGE, TOTAL_MSGS, TOTAL_SHE, TOTAL_TITLE } from "../../constants/strings"
import { Button, Text, Title, BUTTON_ACCENT } from "../ui/Typography"
import metrics from '../../constants/metrics.json';
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

const mapMedia = (m) => ({
    photos: m.photo.toLocaleString('ru-RU'),
    videos: m.video_file.toLocaleString('ru-RU'),
    voices: m.voice_message.toLocaleString('ru-RU'),
    roundVideo: m.video_message.toLocaleString('ru-RU'),
});

export default function SlideScore({ onComplete, completedData, goNext }) {
    const { messages_me, messages_her, total_messages, media_me, media_her, media_total } = metrics.score;
    const [phase, setPhase] = useState(completedData ? 'done' : 'idle');
    const handleMerge = () => setPhase('merging');

    return (
        <motion.div layout className="min-h-screen flex flex-col items-center justify-center">
            <motion.div layout>
                <Title className="text-2xl pb-12">{TOTAL_TITLE}</Title>
            </motion.div>

            <div className="relative flex gap-32 items-center justify-center min-h-[280px] w-full">
                <AnimatePresence mode="wait">
                    {(phase === 'idle' || phase === 'merging') && (
                        <motion.div
                            key="columns"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex gap-32 items-center"
                        >
                            <motion.div
                                className="flex flex-col items-center relative z-10"
                                animate={
                                    phase === 'merging'
                                        ? { x: 280, scale: 0.4, opacity: 0 }
                                        : { x: 0, scale: 1, opacity: 1 }
                                }
                                transition={{ duration: 0.65, ease: 'easeInOut' }}
                                onAnimationComplete={() => {
                                    if (phase === 'merging') setPhase('flash');
                                }}
                            >
                                <Text className="text-8xl">{messages_me.toLocaleString('ru-RU')}</Text>
                                <Text className="text-4xl">{TOTAL_ME}</Text>
                                <Text className="text-xl">{TOTAL_ETC(mapMedia(media_me))}</Text>
                            </motion.div>

                            <div className="w-px h-32 bg-text/20" />

                            <motion.div
                                className="flex flex-col items-center relative z-0"
                                animate={
                                    phase === 'merging'
                                        ? { x: -280, scale: 0.4, opacity: 0 }
                                        : { x: 0, scale: 1, opacity: 1 }
                                }
                                transition={{ duration: 0.65, ease: 'easeInOut' }}
                            >
                                <Text className="text-8xl">{messages_her.toLocaleString('ru-RU')}</Text>
                                <Text className="text-4xl">{TOTAL_SHE}</Text>
                                <Text className="text-xl">{TOTAL_ETC(mapMedia(media_her))}</Text>
                            </motion.div>
                        </motion.div>
                    )}

                    {phase === 'flash' && (
                        <motion.div
                            key="flash"
                            className="absolute w-24 h-24 bg-text rounded-full"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 8, opacity: [0, 0.9, 0] }}
                            transition={{ duration: 0.55, times: [0, 0.35, 1] }}
                            onAnimationComplete={() => setPhase('done')}
                        />
                    )}

                    {phase === 'done' && (
                        <motion.div
                            key="total"
                            className="flex flex-col items-center text-center"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            onAnimationComplete={() => onComplete?.()}
                        >
                            <Text className="text-8xl">{TOTAL_MSGS(total_messages.toLocaleString('ru-RU'))}</Text>
                            <Text className="text-4xl mt-2">{TOTAL_ETC(mapMedia(media_total))}</Text>
                            <Text className="mt-2 text-xl">{TOTAL_DESCIRPTION}</Text>
                            <Button className="mt-8" state={BUTTON_ACCENT} onClick={goNext}>{TOTAL_BUTTON_NEXT}</Button>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {phase === 'idle' && (
                <div className="mt-16 h-14 flex items-center justify-center">
                    <Button data-no-tap-nav onClick={handleMerge} state={BUTTON_ACCENT}>
                        {TOTAL_MERGE}
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
