import { HOURPEEK_BUTTON_AFTER, HOURPEEK_BUTTON_BEFORE, HOURPEEK_QUESTION } from "../../constants/strings";
import { Button, BUTTON_ACCENT, Text, Title } from "../ui/Typography";

export default function SlideHourPeek() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Title>{HOURPEEK_QUESTION}</Title>
            <div className="pt-16 flex">
                <Button state={BUTTON_ACCENT} className="me-2">{HOURPEEK_BUTTON_BEFORE}</Button>
                <Button className="ms-2">{HOURPEEK_BUTTON_AFTER}</Button>
            </div>
        </div>
    )
}
