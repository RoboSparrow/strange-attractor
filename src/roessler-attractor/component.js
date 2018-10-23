import m from 'mithril';

import { init } from './index';
import Dev from '../components/Dev';

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

const StringCheckbox = function(stringAttrs, plotter, prop, value, label) {
    const selector = `input[name=${prop}][type=checkbox]${stringAttrs}`;
    const checked = value === plotter.getState()[prop];
    return m('.mui-checkbox', [
        m('label', {}, [
            m(selector, {
                checked,
                value,
                onchange: e => handleChange(e, 'string', plotter),
            }),
            [m('span', { style: 'padding: 0 1em;' }, label || value)],
        ]),
    ]);
};

class RoesslerAttractor {

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
            Slider('[min=1][max=500]', plotter, 'scale'),
            m('hr'),
            Slider('[min=0.1][max=10][step="0.1"]', plotter, 'a'),
            Slider('[min=0.1][max=10][step="0.1"]', plotter, 'b'),
            Slider('[min=0.1][max=10][step="0.1"]', plotter, 'c'),
            m('hr'),
            m('.mui-form--inline', [
                StringCheckbox('[name=animationMode][type=radio]', plotter, 'animationMode', 'mousemove', 'mouse rotation'),
                StringCheckbox('[name=animationMode][type=radio]', plotter, 'animationMode', 'continous', 'continous rotation'),
            ]),
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

export default RoesslerAttractor;
