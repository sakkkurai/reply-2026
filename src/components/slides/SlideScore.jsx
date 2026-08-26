import { TOTAL_ETC, TOTAL_ME, TOTAL_MERGE, TOTAL_SHE, TOTAL_TITLE } from "../../constants/strings"
import { Button, Text, Title } from "../ui/Typography"
import metrics from '../../constants/metrics.json';

const mapMedia = (m) => ({
    photos: m.photo,
    videos: m.video_file,
    voices: m.voice_message,
    roundVideo: m.video_message,
});

export default function SlideScore() {
    const { messages_me, messages_her, media_me, media_her, media_total } = metrics.score;
    return (
        <div className="min-h-screen flex flex-col items-center justify-center pb-8">
            <Title className="text-2xl pb-12">{TOTAL_TITLE}</Title>

            <div className="flex gap-32">
                <div className="flex flex-col">
                    <Text className="text-8xl">{messages_me}</Text>
                    <Text className="text-4xl">{TOTAL_ME}</Text>
                    <Text className="text-xl">{TOTAL_ETC(mapMedia(media_me))}</Text>
                </div>

                <div className="w-px h-32 bg-text/20" />

                <div className="flex flex-col">
                    <Text className="text-8xl">{messages_her}</Text>
                    <Text className="text-4xl">{TOTAL_SHE}</Text>
                    <Text className="text-xl">{TOTAL_ETC(mapMedia(media_her))}</Text>
                </div>
            </div>
            <Button className="mt-16">{TOTAL_MERGE}</Button>
        </div>
    )
}
