import m from 'mithril';

import { init } from './index';
import Dev from '../components/Dev';

const state = {};
let plotter = null;

document.addEventListener('CatMap:updated', () => {
    const s = (plotter) ? plotter.getState() : null;
    if (state) {
        Object.assign(state, s);
        m.redraw();
    }
});

document.addEventListener('CatMap:computed', () => {
    const s = (plotter) ? plotter.getState() : null;
    if (state) {
        Object.assign(state, s);
        m.redraw();
    }
});

const StepSlider = function(reversingAt) {
    return m('.mui-input-range', [
        m(`input[type=range][min=0][max=${reversingAt}]`, {
            onchange: (e) => {
                const val = parseInt(e.target.value, 10);
                plotter.play(val, val);
            },
        }),
        m('label', 'step'),
    ]);
};

class CatMap {
    oninit() {
        plotter = init('#plotter');
        plotter.plot();
    }

    view() {
        const { step, targetStep, reversingAt, paused } = plotter.getState();
        const running = step !== targetStep;
        return m('form', { className: 'mui-form' }, [
            m('[style="font-weight:bold"]', `iteration: ${state.step || 0}`),
            StepSlider(reversingAt),
            m('', [
                m('button.mui-btn.mui-btn--large.mui-btn--primary.mui-btn--raised', {
                    onclick: (e) => {
                        e.preventDefault();
                        if (running && !paused) {
                            plotter.pause();
                        } else {
                            plotter.play();
                        }
                    },
                }, (!running) ? '▶' : '▮▮'),
                m('button.mui-btn mui-btn--small', {
                    onclick: (e) => {
                        e.preventDefault();
                        plotter.progress(1);
                    },
                    disabled: running,
                }, '>'),
                m('button.mui-btn mui-btn--small', {
                    onclick: (e) => {
                        e.preventDefault();
                        plotter.progress(-1);
                    },
                    disabled: running,
                }, '<'),
            ]),
            m('hr'),
            m(Dev, {
                data: state,
            }),
        ]);
    }
}

export default CatMap;
