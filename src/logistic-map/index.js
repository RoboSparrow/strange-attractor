/**
 * @see http://mathworld.wolfram.com/HenonMap.html
 * @see https://www.dreamincode.net/forums/topic/365205-Henon-Map/
 * @see https://www.rdocumentation.org/packages/nonlinearTseries/versions/0.2.4/topics/henon
 */
import compute from './compute';
import animation from '../animation';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

// state

const State = new StateProvider({
    // coefficients
    r: 3.6,
    // quantity
    maxParticles: 100,
    scale: 100,
});

// rendering

const renderR = function(ctx, r, textColor) {
    const cache = ctx.fillStyle;
    const { height } = ctx.canvas;

    ctx.fillStyle = textColor;
    ctx.font = '10px sans-serif';
    ctx.fillText(`r=${r}`, 5, height - 5);
    ctx.fillStyle = cache;
};

const updateState = function() {
    let { r } = State.get();

    if (r > 4) {
        r = 0;
        State.set({ r });
        return State.get();
    }

    r += 0.01;
    State.set({ r });
    return State.get();
};

const update = function(ctx) {

    const state = updateState();
    const chain = compute(state);

    const { width, height } = ctx.canvas;

    ctx.fillRect(0, 0, width, height);

    let particle;

    const max = chain.length;
    let i = 0;
    let x;
    let y;

    // renderCoords(ctx, state.r, 'rgba(255,255,255,0.5)');

    // clear canvas
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(chain[0].x, chain[0].y);
    ctx.strokeStyle = 'rgba(255,0,0,1)';
    ctx.lineWidth = 1;

    while (i < max) {
        particle = chain[i];

        // interpolating to canvas
        x = Math.floor(width * particle.x);
        y = Math.floor(height * particle.y);

        ctx.lineTo(x, y);

        i += 1;
    }

    ctx.stroke();

    renderR(ctx, state.r, 'rgba(255,0,0,1)');
};

// algorithm


// plotting

const plot = function(ctx) {
    animation.stop();
    contextHelper(ctx)
        .clear('#101010')
        .progress('computing..', '#ff0000');

    animation.assign(() => update(ctx)).play();
    return Promise.resolve(true);
};

const init = function(container = document.body) {
    const canvas = initCanvas(container);
    const { ctx } = contextHelper(canvas).clear('#101010');
    animation.throttle(32);

    return {
        getState: State.get,
        reset: () => {
            State.reset();
            plot(ctx);
        },
        plot: (updates) => {
            State.set(updates);
            plot(ctx);
        },
    };
};

export { init, animation };
