import { HOURPEEK_BUTTON_AFTER, HOURPEEK_BUTTON_BEFORE, HOURPEEK_BUTTON_NEXT, HOURPEEK_DESCRIPTION, HOURPEEK_QUESTION, HOURPEEK_RIGHT_TITLE, HOURPEEK_WRONG_TITLE } from "../../constants/strings";
import { Button, BUTTON_ACCENT, Text, Title, BUTTON_SECONDARY } from "../ui/Typography";
import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Dot, ResponsiveContainer, CartesianGrid } from 'recharts';
import metrics from "../../constants/metrics.json"

const SUNSET_HOUR = 18;

export default function SlideHourPeek({ onComplete, completedData, goNext }) {
    const [answered, setAnswered] = useState(Boolean(completedData));
    const [choice, setChoice] = useState(completedData?.choice ?? null);
    const { peak_hour, hour_histogram } = metrics.peak_hour;

    const beforeSunset = hour_histogram.slice(0, SUNSET_HOUR).reduce((a, b) => a + b, 0);
    const afterSunset = hour_histogram.slice(SUNSET_HOUR).reduce((a, b) => a + b, 0);
    const correctAnswer = afterSunset > beforeSunset ? 'after' : 'before';

    const handleAnswer = (value) => {
        setChoice(value);
        setAnswered(true);
        onComplete?.({ choice: value });
    };

    const chartData = hour_histogram.map((count, hour) => ({
        hour: `${hour}`,
        count,
        isPeak: hour === peak_hour,
    }));

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            {!answered && <Title className="text-center">{HOURPEEK_QUESTION}</Title>}

            <AnimatePresence mode="wait">
                {!answered ? (
                    <motion.div
                        key="quiz"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="pt-16 flex">

                        <Button
                            data-no-tap-nav
                            state={BUTTON_ACCENT}
                            className="me-2"
                            onClick={() => handleAnswer('before')}
                        >
                            {HOURPEEK_BUTTON_BEFORE}
                        </Button>
                        <Button
                            data-no-tap-nav
                            state={BUTTON_SECONDARY}
                            className="ms-2"
                            onClick={() => handleAnswer('after')}
                        >
                            {HOURPEEK_BUTTON_AFTER}
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center w-full max-w-2xl"
                    >
                        <Title>
                            {choice === correctAnswer ? HOURPEEK_RIGHT_TITLE : HOURPEEK_WRONG_TITLE}
                        </Title>

                        <motion.div
                            className="w-full mt-10 flex flex-col items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >

                            <div className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <XAxis
                                            dataKey="hour"
                                            interval={0}
                                            tick={{ fontSize: 11, fill: 'var(--color-text)' }}
                                            axisLine={{ stroke: 'var(--color-text)', strokeOpacity: 0.3 }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            hide={false}
                                            tick={{ fontSize: 11, fill: 'var(--color-text)' }}
                                            axisLine={{ stroke: 'var(--color-text)', strokeOpacity: 0.3 }}
                                            tickLine={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="var(--color-bg-alt)"
                                            strokeWidth={3}
                                            dot={<PeakDot />}
                                            animationDuration={1200}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <Text className="text-xl mt-2">
                                {HOURPEEK_DESCRIPTION(peak_hour)}
                            </Text>
                            <Button className="mt-8" onClick={goNext} state={BUTTON_ACCENT}>{HOURPEEK_BUTTON_NEXT}</Button>
                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div >
    );
}

function PeakDot(props) {
    const { cx, cy, payload } = props;
    if (payload.isPeak) {
        return <circle cx={cx} cy={cy} r={6} fill="var(--color-text)" stroke="var(--color-bg)" strokeWidth={2} />;
    }
    return <circle cx={cx} cy={cy} r={3} fill="var(--color-bg-alt)" />;
}
