import m from 'mithril';
import { init } from '../logistic-map';
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

class LogisticMap {

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
            Slider('[min=10][max=1000]', plotter, 'maxParticles'),
            m('hr'),
            ResetButton(plotter),
            m('hr'),
            m('p', [
                'Order descents into chaos.',
                m('br'),
                'Demonstration of the logistic map, the progression of coefficent',
                m('i[class=mui--text-dark-secondary]', ' r '),
                ' in ',
                m('i[class=mui--text-dark-secondary]', [
                    'x',
                    m('sub', 'n+1'),
                    ' = rx',
                    m('sub', 'n'),
                    '(1-x',
                    m('sub', 'n'),
                    ')',
                ]),
            ]),
            m(Dev, {
                data: {
                    plotter: plotter.getState(),
                }
            }),
        ]);
    }
}

export default LogisticMap;
