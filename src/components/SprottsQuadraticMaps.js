import m from 'mithril';

import { init, Patterns, createRandomPattern } from '../sprotts-quadratic-maps';
import Dev from './Dev';

//data binding helper function
const handleChange = function(e, type, plotter) {
    e.preventDefault();

    let { name, value } = e.target;// eslint-disable-line prefer-const
    switch (type) {
        case 'number':
            value = parseFloat(value);
            break;
        case 'string':
        default:
            // nothing
    }

    plotter.plot({
        [name]: value,
    });
    // todo `Worker error: "${message}" in ${filename}:${lineno}`
};

class RandomPattern {
    handleChange(e, plotter) { // eslint-disable-line class-methods-use-this
        e.preventDefault();

        const pattern = createRandomPattern();
        plotter.plot({
            pattern: pattern,
        });
    }

    view(vnode) {
        const { plotter } = vnode.attrs;
        return m('a.mui--text-menu', { onclick: e => this.handleChange(e, plotter) }, ' » random');
    }
}

class PatternInput {
    view(vnode) { // eslint-disable-line class-methods-use-this
        const { plotter } = vnode.attrs;
        const { pattern } = plotter.getState();

        return m('.mui-form--inline', [
            m('mui-textfield', [
                m('input[name=pattern][type=text]', {
                    value: pattern,
                    onchange: e => handleChange(e, 'string', plotter),
                }),
                m(RandomPattern, { plotter }),
            ]),
        ]);
    }
}

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

const PatternsList = function(plotter) {
    const current = plotter.getState().pattern;

    return m('', Patterns.map(pattern => m('.mui-checkbox', [
        m('label', [
            m('input[type=checkbox][name=pattern]', {
                checked: pattern === current,
                value: pattern,
                onchange: e => handleChange(e, 'string', plotter),
            }),
            [m('span', { style: 'padding: 0 1em;' }, pattern)],
        ]),
    ])));

};

class SprottsQuadraticMaps {

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

        return m('form', { className: 'mui-form', onsubmit: e => e.preventDefault() }, [
            Slider('[min=100][max=150000]', plotter, 'maxParticles'),
            Slider('[min=1][max=500]', plotter, 'scale'),
            m('hr'),
            m(PatternInput, { plotter }),
            m('hr'),
            PatternsList(plotter),
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

export default SprottsQuadraticMaps;
