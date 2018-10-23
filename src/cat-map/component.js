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

class CatMap {
    oninit() {
        plotter = init('#plotter');
    }

    view() { //
        return m('form', { className: 'mui-form' }, [
            m('[style="font-weight:bold"]', `iteration: ${state.step || 0}`),
            m('', [
                m('span.mui-btn.mui-btn--large.mui-btn--primary.mui-btn--raised', {
                    onclick: () => plotter.plot()
                }, 'Play'),
            ]),
            m('hr'),
            m(Dev, {
                data: state,
            }),
        ]);
    }
}

export default CatMap;
