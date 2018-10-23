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

/* eslint-disable class-methods-use-this */
class CatMap {
    oninit() {
        plotter = init('#plotter');
        plotter.plot();
    }

    view() { //
        return m('form', { className: 'mui-form' }, [
            m('[style="font-size: 2em;"]', state.step || 0),
            m(Dev, {
                data: {
                    step: state.step,
                },
            }),
        ]);
    }
}

export default CatMap;
