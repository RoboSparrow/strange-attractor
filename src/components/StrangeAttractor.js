import m from 'mithril';

import { init, animation } from '../strange-attractor';
import Dev from './Dev';

//data binding helper function
const handleChange = function(e, type, plotter) {
    e.preventDefault();

    let { name, value } = e.target;// eslint-disable-line prefer-const
    switch (type) {
        case 'number':
            value = parseInt(value, 10);
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

const ResetButton = function(plotter) {
    return m('button.mui-btn.mui-btn--small.mui-btn--primary', { onclick: (e) => {
        e.preventDefault();
        plotter.reset();
    } }, 'Reset');
};

class StrangeAttractor {

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
        const state = plotter.getState();

        return m('form', { className: 'mui-form' }, [
            Slider('[type=range][min=1][max=300]', plotter, 'focalLength'),
            Slider('[type=range][min=5][max=255]', plotter, 'pixelDensity'),
            m('.mui-form--inline', [
                StringCheckbox('[name=animationMode][type=radio]', plotter, 'animationMode', 'mousemove', 'mouse rotation'),
                StringCheckbox('[name=animationMode][type=radio]', plotter, 'animationMode', 'continous', 'continous rotation'),
            ]),
            m('hr'),
            ResetButton(plotter),
            m(Dev, {
                data: {
                    plotter: state,
                    fps: animation.getState().fps
                }
            }),
        ]);
    }
}

export default StrangeAttractor;
