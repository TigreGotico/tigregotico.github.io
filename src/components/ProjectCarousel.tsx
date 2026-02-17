import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Github, ExternalLink } from 'lucide-react';

interface Project {
  name: string;
  description: string;
  image: string;
  github: string;
}

interface ProjectCarouselProps {
  projects: Project[];
  autoplay?: boolean;
  autoplaySpeed?: number;
}

const ProjectCarousel = ({ projects, autoplay = true, autoplaySpeed = 5000 }: ProjectCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return projects.length - 1;
      if (nextIndex >= projects.length) return 0;
      return nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoplay) return;

    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        paginate(1);
      }, autoplaySpeed);
    };

    resetTimeout();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, autoplay, autoplaySpeed]);

  const currentProject = projects[currentIndex];

  return (
    <div className="relative w-full">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-border shadow-lg">
        <div className="relative h-[500px] md:h-[600px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full h-full"
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gradient-to-br from-muted/20 to-muted/5 
                                flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-border/50">
                  <img
                    src={currentProject.image}
                    alt={currentProject.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center w-full h-full">
                            <span class="text-9xl font-serif font-bold text-primary/10">${currentProject.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 tracking-tight">
                        {currentProject.name}
                      </h3>
                      <div className="w-16 h-0.5 bg-primary"></div>
                    </div>

                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 font-light">
                      {currentProject.description}
                    </p>

                    <a
                      href={currentProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground 
                               rounded-lg font-medium hover:bg-primary/90 transition-all duration-200
                               shadow-md hover:shadow-lg hover:scale-105 group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="w-5 h-5" />
                      <span>View on GitHub</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => paginate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10
                     bg-white/90 hover:bg-white p-3 rounded-full shadow-lg
                     border border-border hover:border-primary/50
                     transition-all duration-200 hover:scale-110"
          aria-label="Previous project"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                     bg-white/90 hover:bg-white p-3 rounded-full shadow-lg
                     border border-border hover:border-primary/50
                     transition-all duration-200 hover:scale-110"
          aria-label="Next project"
        >
          <ChevronRight className="w-6 h-6 text-foreground" />
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="flex justify-center gap-3 mt-8">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full
              ${index === currentIndex 
                ? 'bg-primary w-12 h-3' 
                : 'bg-border hover:bg-primary/30 w-3 h-3'
              }`}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCarousel;
