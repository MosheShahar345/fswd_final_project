const AnimatedParticles = () => {
  return (
    <div className="particles-container">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="particle" style={{
          '--delay': `${i * 0.5}s`,
          '--duration': `${3 + i * 0.2}s`,
          '--size': `${10 + i * 2}px`,
          '--opacity': `${0.1 + i * 0.02}`
        }}></div>
      ))}
    </div>
  );
};

export default AnimatedParticles;
