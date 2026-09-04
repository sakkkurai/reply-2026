import { motion } from 'framer-motion';
import { Button, BUTTON_ACCENT, Text, Title } from '../ui/Typography';
import { TOPWORDS_BUTTON_INTRO_NEXT, TOPWORDS_DESCRIPTION, TOPWORDS_TITLE } from '../../constants/strings';


export default function SlideTopWords({ onComplete, completedData, goNext }) {
    return (
        <motion.div layout className="min-h-screen flex flex-col items-center justify-center text-center">
            <Title>{TOPWORDS_TITLE}</Title>
            <Text className='mx-32'>{TOPWORDS_DESCRIPTION}</Text>
            <Button state={BUTTON_ACCENT} className='mt-8' onClick={goNext}>{TOPWORDS_BUTTON_INTRO_NEXT}</Button>
        </motion.div>
    );
}
