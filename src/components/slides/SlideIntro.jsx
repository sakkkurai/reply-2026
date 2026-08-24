import { GREETING, REPLY, LETS_GO } from "../../constants/strings";

export default function SlideIntro({ onNext }) {
    return (
        <div className="flex flex-col items-center">
            <h1 className="font-bold text-center">{REPLY}</h1>
            <p className="text-center">{GREETING}</p>
            <button className="flex justify-center" onClick={onNext}>{LETS_GO}</button>
        </div>

    );
}
