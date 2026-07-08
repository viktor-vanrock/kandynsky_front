import React from 'react';

const TRANSITION_MS = 560;

// Keeps the previous screen mounted while the new one fades in.
// children is a render-prop: (screen, model) => JSX
const ScreenTransition = ({ screen, model, children }) => {
  const [layers, setLayers] = React.useState(() => [
    { id: 0, screen, model, phase: 'in' },
  ]);
  const nextId = React.useRef(1);
  const lastScreen = React.useRef(screen);
  const lastModel = React.useRef(model);

  React.useEffect(() => {
    if (screen === lastScreen.current && model === lastModel.current) return;
    lastScreen.current = screen;
    lastModel.current = model;

    setLayers((prev) => {
      const exiting = prev.map((l) => ({ ...l, phase: 'out' }));
      return [...exiting, { id: nextId.current++, screen, model, phase: 'in' }];
    });

    const t = setTimeout(() => {
      setLayers((prev) => prev.filter((l) => l.phase === 'in'));
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [screen, model]);

  return (
    <React.Fragment>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`screen-anim ${layer.phase === 'in' ? 'is-in' : 'is-out'}`}
          aria-hidden={layer.phase === 'out' ? 'true' : undefined}
        >
          {children(layer.screen, layer.model)}
        </div>
      ))}
    </React.Fragment>
  );
};

export { ScreenTransition };
