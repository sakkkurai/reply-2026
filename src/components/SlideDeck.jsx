import { useParams, useNavigate } from 'react-router-dom';
import { SLIDES, TOTAL_SLIDES } from '../constants/slides';
import SlidePlaceholder from './SlidePlaceholder';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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

    return (
        <div>
            <SlidePlaceholder id={currentSlide.id} title={currentSlide.title} />
            <div>
                {slideId > 1 && (
                    <button onClick={goPrev} className='fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3'>
                        <ChevronLeft className="text-text" size={36} />
                    </button>
                )}
                {slideId < TOTAL_SLIDES && slideId > 1 && (
                    <button onClick={goNext} className='fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3' >
                        <ChevronRight className='text-text' size={36} />
                    </button>
                )}
            </div>
        </div >
    );
}

export default SlideDeck;
