/**
 * @see http://mathworld.wolfram.com/HenonMap.html
 * @see https://www.dreamincode.net/forums/topic/365205-Henon-Map/
 * @see https://www.rdocumentation.org/packages/nonlinearTseries/versions/0.2.4/topics/henon
 */
import compute from './compute';
import animation from '../animation';

import initCanvas from '../canvas';
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

const update = function(ctx, chain) {

    const state = State.get();
    State.set({ r: (state.r > 4) ? 0 : state.r + 0.005 });
    chain = compute(state);

    const { width, height } = ctx.canvas;

    ctx.fillRect(0, 0, width, height);

    //const { scale } = State.get();
    const translateY = height / 2;

    let particle;

    const max = chain.length;
    let i = 0;
    let x;
    let y;

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
        y = Math.floor(translateY * particle.y);

        ctx.lineTo(x, y);

        i += 1;
    }

    // fill canvas
    ctx.stroke();

    renderR(ctx, state.r, 'rgba(255,0,0,1)');
};

// algorithm


// plotting

const plot = function(ctx) {
    const state = State.get();
    return Promise.resolve(compute(state)).then((chain) => {
        animation.init(() => update(ctx, chain), { fps: 32 });
        return true;
    });
};

const initcontext2d = function(canvas) {
    const { width, height } = canvas;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, width, height);
    return ctx;
};


const init = function(container = document.body) {
    const canvas = initCanvas(container);
    const ctx = initcontext2d(canvas);

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
