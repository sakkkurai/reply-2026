import { GREETING, REPLY, LETS_GO, COVERAGE_DATES } from "../../constants/strings";
import { Button, BUTTON_ACCENT, Text, Title } from "../ui/Typography";
import metrics from '../../constants/metrics.json';
import { ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const container = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.5 },
    },
};

const line = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SlideIntro() {
    const navigate = useNavigate();
    const lines = GREETING.split('\n');
    const { date_from, date_to } = metrics.score;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Title className="m-4">{REPLY}</Title>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="visible"
                className="mx-32 flex flex-col items-center"
            >
                {lines.map((l, i) => (
                    <motion.div key={i} variants={line}>
                        <Text className="text-center">{l}</Text>
                    </motion.div>
                ))}
                <Text className="text-xl mt-8">{COVERAGE_DATES(date_from.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3.$2.$1"), date_to.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3.$2.$1"))}</Text>

            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: lines.length * 0.5 + 0.6 }}
            >


                <Button
                    className="flex items-center justify-center gap-2 mt-4"
                    state={BUTTON_ACCENT}
                    onClick={() => navigate('/slide/1')}
                >
                    {LETS_GO}
                    <ArrowRight size={20} />
                </Button>

            </motion.div>
        </div>
    );
}
