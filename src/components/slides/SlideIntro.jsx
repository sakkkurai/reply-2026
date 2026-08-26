import { GREETING, REPLY, LETS_GO } from "../../constants/strings";
import { Button, Text, Title } from "../ui/Typography";
import { ArrowRight, StepForward } from "lucide-react";
export default function SlideIntro({ onNext }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center pb-8">
            <Title className="m-4">{REPLY}</Title>
            <Text className="mx-32 pb-8">{GREETING}</Text>
            <Button className="flex items-center justify-center gap-2" onClick={onNext}>{LETS_GO}
                <ArrowRight size={20} className="ml-2 " />
            </Button>
        </div>

    );
}
