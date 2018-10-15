import m from 'mithril';

import { init } from '../lorenz-attractor';
import Dev from './Dev';

//data binding helper function
const handleChange = function(e, type, plotter) {
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

const Slider = function(stringAttrs, plotter, prop, label) {
    const selector = `input[name=${prop}][type=range]${stringAttrs}`;
    const value = plotter.getState()[prop];

    return m('.mui-input-range', [
        m(selector, {
            value,
            onchange: e => handleChange(e, 'number', plotter),
        }),
        m('label', {}, [
            `${label || prop} ${value}`,
        ]),
    ]);
};

const ResetButton = function(plotter) {
    return m('button.mui-btn.mui-btn--small.mui-btn--primary', { onclick: (e) => {
        e.preventDefault();
        plotter.reset();
    } }, 'Reset');
};

class LorenzAttractor {

    constructor() {
        this.formState = {};
    }

    oninit() {
        this.plotter = init('#plotter', this.formState);
        this.plotter.plot();

        this.formState = this.plotter.getState();
    }

    view() {
        const { plotter } = this;

        return m('form', { className: 'mui-form' }, [
            Slider('[min=100][max=10000]', plotter, 'maxParticles'),
            Slider('[min=1][max=50][step="0.25"]', plotter, 'scale'),
            m('hr'),
            Slider('[min=1][max=50][step="0.25"]', plotter, 'a'),
            Slider('[min=1][max=50][step="0.25"]', plotter, 'b'),
            Slider('[min=1][max=50][step="0.25"]', plotter, 'c'),
            m('hr'),
            Slider('[min=0.1][max=10]', plotter, 'alpha'),
            Slider('[min=0.1][max=10]', plotter, 'beta'),
            m('hr'),
            ResetButton(plotter),
            m(Dev, {
                data: {
                    plotter: plotter.getState(),
                }
            }),
        ]);
    }
}

export default LorenzAttractor;
