import { useParams, useNavigate } from 'react-router-dom';
import { SLIDES, TOTAL_SLIDES } from '../constants/slides';
import SlideIntro from './slides/SlideIntro';
import SlideScore from './slides/SlideScore';
import SlidePlaceholder from './SlidePlaceholder';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const SLIDE_COMPONENTS = {
    1: SlideIntro,
    2: SlideScore,
}

function SlideDeck() {
    const { id } = useParams();
    const navigate = useNavigate();
    const slideId = Number(id);
    console.log({ idFromParams: id, parsedSlideId: slideId, SLIDES });

    const currentSlide = SLIDES.find(s => s.id === slideId);

    if (!currentSlide) {
        return <p>Слайд не найден!</p>
    }

    const goNext = () => {
        if (slideId < TOTAL_SLIDES) {
            navigate(`/slide/${slideId + 1}`);
        }
    };
    const goPrev = () => {
        if (slideId > 1) {
            navigate(`/slide/${slideId - 1}`);
        }
    };

    const SlideComponent = SLIDE_COMPONENTS[slideId] ?? (() => <SlidePlaceholder id={currentSlide.id} title={currentSlide.title} />)

    return (
        <div>
            <SlideComponent onNext={goNext} />
            {slideId > 2 && (
                <button onClick={goPrev} className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 cursor-pointer">
                    <ChevronLeft className="text-text" size={36} />
                </button>
            )}
            {slideId < TOTAL_SLIDES && slideId > 1 && (
                <button onClick={goNext} className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 cursor-pointer">
                    <ChevronRight className="text-text" size={36} />
                </button>
            )}
        </div>
    );
}

export default SlideDeck;
