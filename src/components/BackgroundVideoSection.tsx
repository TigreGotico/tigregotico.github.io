import React from 'react';

const BackgroundVideoSection = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src="https://www.youtube.com/embed/-niUBSx3PKQ?autoplay=1&mute=1&loop=1&playlist=-niUBSx3PKQ&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Background Video"
      ></iframe>
      {/* Optional overlay content */}
      <div className="relative z-10 flex items-center justify-center h-full bg-black bg-opacity-50">
        <h2 className="text-white text-4xl font-bold">Your Content Here</h2>
      </div>
    </section>
  );
};

export default BackgroundVideoSection;
