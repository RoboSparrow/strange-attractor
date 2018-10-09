/* global m */
import { init, getState } from '../henon-map';
import Dev from './Dev';

//data binding helper function
const binds = function(data, prop) {
    return {
        value: data[prop],
        onchange: function(e) {
            data[e.target.name] = parseInt(e.target.value, 10);
            e.preventDefault();
        },

    };
};

const Slider = function(selector, bindingData, bindingProp, label) {
    return m('.mui-input-range', [
        m(selector, binds(bindingData, bindingProp)),
        m('label', {}, [
            `${label || bindingProp} ${bindingData[bindingProp]}`,
        ]),
    ]);
};

class HenonMap {

    constructor() {
        this.formState = getState();
    }

    oninit(vnode) {
        const { screen } = vnode.attrs;
        init(screen, this.formState);
    }

    view() {
        const { formState } = this;

        return m('form', { className: 'mui-form' }, [
            Slider('input[name=focalLength][type=range][min=0][max=1000]', formState, 'focalLength'),
            Slider('input[name=pixelDensity][type=range][min=5][max=255]', formState, 'pixelDensity'),
            m(Dev, {
                data: {
                    formState,
                }
            }),
        ]);
    }
}

export default HenonMap;
