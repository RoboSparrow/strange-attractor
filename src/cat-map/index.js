/**
 * @see https://en.wikipedia.org/wiki/Arnold%27s_cat_map
 * note: cat map images need to be quadratic: "...on a circular ring with circumference N"
 */
import Worker from './compute.worker';
import animation from '../animation';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

import CatImage from '../images/cat.jpg';

const UpdatedEvent = new Event('CatMap:updated');
const ComputedEvent = new Event('CatMap:computed');

// state

const State = new StateProvider({
    imgSrc: CatImage,

    step: 0,
    interval: 24,
    targetStep: 0,
    reversingAt: 0,
    paused: false, // use only for notifying component
});

const worker = new Worker();

// single item cache

const _Cache = {
    imgSrc: '',
    cycle: [],
};

const hasCache = function(imgSrc) {
    return imgSrc === _Cache.imgSrc && _Cache.cycle.length;
};

const getCache = function(imgSrc) {
    return (hasCache(imgSrc)) ? _Cache.cycle : null;
};

const setCache = function(imgSrc, cycle) {
    _Cache.imgSrc = imgSrc;
    _Cache.cycle = cycle;
};

const clearCache = function() {
    _Cache.imgSrc = '';
    _Cache.cycle = [];
};

// algorithm

const compute = function(ctx) {

    const state = State.get();
    const { imgSrc } = state;
    let cycle = getCache(imgSrc);

    State.set({
        step: 0,
        targetStep: 0,
        reversingAt: 0,
        running: false,
    });// reset

    if (cycle) {
        document.dispatchEvent(ComputedEvent);
        State.set({
            reversingAt: cycle.length - 1,
        });// reset
        return Promise.resolve(cycle);
    }

    const { width, height } = ctx.canvas;
    const pixelData = ctx.getImageData(0, 0, width, height).data;
    const id = performance.now();

    contextHelper(ctx).progress('computing..', 'rgba(255,255,255,1)', 'rgba(0,0,0,.9)');

    return new Promise((resolve, reject) => {

        worker.addEventListener('message', (e) => {
            // todo track progress
            if (e.data.id !== id) {
                return;
            }

            ({ cycle } = e.data);
            State.set({
                reversingAt: cycle.length - 1,
            });// reset

            setCache(imgSrc, cycle);
            document.dispatchEvent(ComputedEvent);
            resolve(cycle);
        });

        worker.addEventListener('error', (error) => {
            reject(error);
        });

        worker.postMessage({
            id,
            state,
            width,
            height,
            pixelData,
        });
    });

};

const update = function(ctx, cycle) {
    const { step, targetStep, paused } = State.get();
    const { width, height } = ctx.canvas;

    if (paused) { // set by component
        return;
    }

    const next = cycle[step];

    const imageData = ctx.getImageData(0, 0, width, height);

    imageData.data.set(next);
    ctx.putImageData(imageData, 0, 0);

    if (step < targetStep) {
        State.set({
            step: step + 1,
        });
    }

    document.dispatchEvent(UpdatedEvent);
};

// plotting
const loadImage = function(imgSrc, ctx) {

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = function() {
            const { width, height } = this;

            // cat map only restores on quadratic canvas
            const squared = (width > height) ? height : width;
            ctx.canvas.width = squared;
            ctx.canvas.height = squared;

            ctx.drawImage(this, 0, 0, squared, squared, 0, 0, squared, squared);
            resolve(this);
        };
        img.onerror = function(error) {
            reject(error);
        };
    });

};

const plot = function(ctx) {
    contextHelper(ctx)
        .clear('#101010')
        .progress('computing..', '#ff0000');

    const { imgSrc } = State.get();

    // cached cycle
    if (hasCache(imgSrc)) {
        return compute(ctx)
            .then(cycle => update(ctx, cycle));
    }
    animation.stop();
    // new cycle
    clearCache();
    return loadImage(imgSrc, ctx)
        .then(() => compute(ctx))
        .then((cycle) => {
            animation
                .throttle(State.get().interval)
                .assign(() => update(ctx, cycle))
                .play();
        });
};

const init = function(container = document.body) {
    const canvas = initCanvas(container);
    const { ctx } = contextHelper(canvas).clear('#101010');
    const { imgSrc } = State.get();

    animation.stop();
    clearCache();
    loadImage(imgSrc, ctx);

    return {
        getState: State.get,
        setState: State.set,
        reset: () => {
            State.reset();
            plot(ctx);
        },
        plot: (updates) => {
            State.set(updates);
            plot(ctx);
        },
        pause: () => {
            State.set({ paused: !State.get().paused });
        },
        play: (start, end) => {
            const cycle = getCache(State.get().imgSrc);
            if (!cycle) {
                return;
            }
            State.set({
                step: start || 0,
                targetStep: end || State.get().reversingAt,
                paused: false,
            });
            update(ctx, cycle);
        },
        progress: (direction) => {
            const { reversingAt, step } = State.get();
            let next;

            const cycle = getCache(State.get().imgSrc);
            if (!cycle) {
                return;
            }

            next = step + direction;
            if (next >= reversingAt) {
                next = reversingAt;
            }
            if (next < 0) {
                next = 0;
            }

            State.set({
                step: next,
                targetStep: next,
                paused: false,
            });
            update(ctx, cycle);
        },
    };
};

export { init, animation };
