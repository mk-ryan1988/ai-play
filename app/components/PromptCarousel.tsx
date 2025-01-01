'use client';
import { useRef, useState, useEffect } from 'react';
import Dialog from './Dialog';

interface Prompt {
  id: number;
  title: string;
  description: string;
}

const suggestedPrompts: Prompt[] = [
  {
    id: 1,
    title: "Daily Tasks",
    description: "Create a list of tasks for today with priorities and deadlines"
  },
  {
    id: 2,
    title: "Meeting Notes",
    description: "Start taking notes for your next meeting with action items"
  },
  {
    id: 3,
    title: "Project Plan",
    description: "Draft a project plan with milestones and deliverables"
  },
  {
    id: 4,
    title: "Quick Ideas",
    description: "Brainstorm ideas for your next project or initiative"
  },
  {
    id: 5,
    title: "Weekly Review",
    description: "Summarize your achievements and plan for next week"
  },
  {
    id: 6,
    title: "Feedback Session",
    description: "Prepare points for your next feedback session"
  }
];

const PromptCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const handleCardClick = (prompt: Prompt) => {
    setSelectedType(prompt.title.toLowerCase().replace(/\s+/g, '-'));
    setDialogOpen(true);
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cards = scrollRef.current.getElementsByClassName('carousel-card');
      if (cards[index]) {
        cards[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
        setActiveIndex(index);
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(scrollRef.current?.getElementsByClassName('carousel-card') || [])
              .indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    const cards = scrollRef.current?.getElementsByClassName('carousel-card');
    if (cards) {
      Array.from(cards).forEach((card) => observer.observe(card));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-8 -mx-8 md:mx-0 max-w-screen">
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 -mb-2 px-8 md:px-[1px] scroll-smooth"
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            paddingRight: 'calc(2rem + 10%)'
          }}
        >
          {suggestedPrompts.map((prompt, index) => (
            <div
              key={prompt.id}
              className="carousel-card flex-none w-[85%] md:w-[45%] snap-start p-6 bg-dark-secondary
                        border border-dark-tertiary rounded-lg cursor-pointer
                        hover:border-gray-500 transition-colors"
              onClick={() => handleCardClick(prompt)}
            >
              <h3 className="text-lg font-semibold mb-2">{prompt.title}</h3>
              <p className="text-sm text-gray-400">{prompt.description}</p>
            </div>
          ))}
        </div>

        <div className="absolute right-0 top-0 bottom-6 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(suggestedPrompts.length / 2) }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index * 2)}
            className={`h-1 rounded-full transition-all duration-300 ${
              Math.floor(activeIndex / 2) === index
                ? 'w-8 bg-gray-300'
                : 'w-4 bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={selectedType}
      />
    </div>
  );
};

export default PromptCarousel;
