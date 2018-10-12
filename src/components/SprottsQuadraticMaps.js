/* global m */
import { init, Patterns, createRandomPattern } from '../sprotts-quadratic-maps';
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

class RandomPattern {
    constructor() {
        this.pattern = '';
    }

    oninit(vnode) {
        this.pattern = vnode.attrs.plotter.getState().pattern;
    }
    // todo only updates after second click -> separate textfield in extra component
    onupdate(vnode) {
        this.pattern = vnode.attrs.plotter.getState().pattern;
    }

    handleChange(e, plotter) {
        e.preventDefault();

        this.pattern = createRandomPattern();
        plotter.plot({
            pattern: this.pattern,
        });
    }

    view(vnode) {
        const { plotter } = vnode.attrs;
        return m('.mui-form--inline', [
            m('mui-textfield', [
                m('input[type=text]', { value: this.pattern }),
                m('a', { onclick: e => this.handleChange(e, plotter) }, 'random pattern'),
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

        return m('form', { className: 'mui-form' }, [
            Slider('[min=100][max=10000]', plotter, 'maxParticles'),
            Slider('[min=1][max=500]', plotter, 'scale'),
            m('hr'),
            m(RandomPattern, { plotter }),
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
