/* global m */
import { init } from '../henon-map';
import Dev from './Dev';

//data binding helper function
const binds = function(plotter, prop) {
    return {
        value: plotter.getState()[prop],

        onchange: function(e) {
            e.preventDefault();

            const value = parseInt(e.target.value, 10);
            plotter.plot({
                [prop]: value,
            });

        },

    };
};

const Slider = function(stringAttrs, plotter, prop, label) {
    const selector = `input[name=${prop}][type=range]${stringAttrs}`;
    const value = plotter.getState()[prop];

    return m('.mui-input-range', [
        m(selector, binds(plotter, prop)),
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

class HenonMap {

    constructor() {
        this.formState = {};
        this.ani = null;
    }

    oninit(vnode) {
        const { screen } = vnode.attrs;

        this.plotter = init(screen, this.formState);
        this.plotter.plot();

        this.formState = this.plotter.getState();
    }

    view() {
        const { plotter } = this;

        return m('form', { className: 'mui-form' }, [
            Slider('[min=100][max=10000]', plotter, 'maxParticles'),
            Slider('[min=1][max=500]', plotter, 'scale'),
            m('hr'),
            Slider('[min=0.1][max=10]', plotter, 'alpha'),
            Slider('[min=0.1][max=10]', plotter, 'beta'),
            m('hr'),
            ResetButton(plotter),
            m(Dev, {
                data: {
                    state: plotter.getState(),
                }
            }),
        ]);
    }
}

export default HenonMap;
