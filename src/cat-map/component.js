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

//data binding helper function
const handleChange = function(e, type) {
    e.preventDefault();

    let { name, value } = e.target;// eslint-disable-line prefer-const
    switch (type) {
        case 'number':
            value = parseFloat(value);
            break;
        default:
            // nothing
    }

    plotter.plot({
        [name]: value,
    });
};

const Slider = function(stringAttrs, prop, label) {
    const selector = `input[name=${prop}][type=range]${stringAttrs}`;
    const value = plotter.getState()[prop];

    return m('.mui-input-range', [
        m(selector, {
            value,
            onblur: e => handleChange(e, 'number'),
        }),
        m('label', {}, [
            `${label || prop} ${value}`,
        ]),
    ]);
};

class CatMap {
    oninit() {
        plotter = init('#plotter');
    }

    view() {
        const { reversingAt } = plotter.getState();
        //c onst display = (reversingAt > 0) ? 'style="display:block"' : 'style="display:none"';//TODO
        const display = 'style="display:none"';

        return m('form', { className: 'mui-form' }, [
            m('[style="font-weight:bold"]', `iteration: ${state.step || 0}`),
            Slider(`[min=0][max=${reversingAt}][${display}]`, 'targetStep'),
            m('.mui-btn.mui-btn--small.mui-btn--primary.mui-btn--flat[name=targetStep]', {
                value: 0,
                onclick: e => handleChange(e, 'number', plotter),
            }, 'original'),
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
