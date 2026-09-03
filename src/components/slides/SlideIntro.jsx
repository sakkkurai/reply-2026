import { GREETING, REPLY, LETS_GO } from "../../constants/strings";
import { Button, BUTTON_ACCENT, Text, Title } from "../ui/Typography";
import { ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function SlideIntro() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Title className="m-4">{REPLY}</Title>
            <Text className="mx-32">{GREETING}</Text>
            <Button className="flex items-center justify-center gap-2 mt-8" state={BUTTON_ACCENT} onClick={() => navigate('/slide/1')}>
                {LETS_GO}
                <ArrowRight size={20} className="ml-2 " />
            </Button>
        </div>

    );
}
