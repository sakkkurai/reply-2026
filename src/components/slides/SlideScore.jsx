import { TOTAL_ETC, TOTAL_ME, TOTAL_MERGE, TOTAL_SHE, TOTAL_TITLE } from "../../constants/strings"
import { Button, Text, Title } from "../ui/Typography"
import metrics from '../../constants/metrics.json';
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

const mapMedia = (m) => ({
    photos: m.photo,
    videos: m.video_file,
    voices: m.voice_message,
    roundVideo: m.video_message,
});

export default function SlideScore() {
    const [showTotal, setShowTotal] = useState(false);
    const { messages_me, messages_her, total_messages, media_me, media_her, media_total } = metrics.score;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center pb-8">
            <Title className="text-2xl pb-12">{TOTAL_TITLE}</Title>

            <div className="relative flex gap-32 items-center justify-center min-h-[280px]">
                <AnimatePresence mode="wait">
                    {!showTotal ? (
                        <motion.div
                            key="columns"
                            className="flex gap-32 items-center"
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.div
                                className="flex flex-col items-center"
                                animate={showTotal ? { x: 120 } : { x: 0 }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            >
                                <Text className="text-8xl">{messages_me}</Text>
                                <Text className="text-4xl">{TOTAL_ME}</Text>
                                <Text className="text-xl">{TOTAL_ETC(mapMedia(media_me))}</Text>
                            </motion.div>

                            <div className="w-px h-32 bg-text/20" />

                            <motion.div
                                className="flex flex-col items-center"
                                animate={showTotal ? { x: -120 } : { x: 0 }}
                                transition={{ duration: 0.6, ease: 'easeInOut' }}
                            >
                                <Text className="text-8xl">{messages_her}</Text>
                                <Text className="text-4xl">{TOTAL_SHE}</Text>
                                <Text className="text-xl">{TOTAL_ETC(mapMedia(media_her))}</Text>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="total"
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Text className="text-8xl">{total_messages}</Text>
                            <Text className="text-xl mt-2">{TOTAL_ETC(mapMedia(media_total))}</Text>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!showTotal && (
                <Button className="mt-16" onClick={() => setShowTotal(true)}>
                    {TOTAL_MERGE}
                </Button>
            )}
        </div>
    );
}
