/* global m */

import init, { getState, getAnimationState } from './strange-attractor/index';

//data binding helper function
const formState = getState();

const binds = function(data, prop) {
    return {
        value: data[prop],
        onchange: function(e) {
            data[e.target.name] = parseInt(e.target.value, 10);
            e.preventDefault();
        },

    };
};

const Dev = {
    view: vnode => m('pre', {}, `${JSON.stringify(vnode.attrs.formState)}`)
};

const Fps = {
    view: vnode => m('pre', {}, `fps: ${vnode.attrs.animationState.fps}`)
};

const Slider = function(selector, bindingData, bindingProp, label) {
    return m('.mui-input-range', [
        m(selector, binds(bindingData, bindingProp)),
        m('label', {}, [
            `${label || bindingProp} ${bindingData[bindingProp]}`,
        ]),
    ]);
};

const App = {
    view: () => m('form', { className: 'mui-form' }, [
        m(Fps, { animationState: getAnimationState() }),
        Slider('input[name=focalLength][type=range][min=0][max=1000]', formState, 'focalLength'),
        Slider('input[name=pixelDensity][type=range][min=5][max=255]', formState, 'pixelDensity'),
        m(Dev, { formState })
    ]),
};

document.addEventListener('DOMContentLoaded', () => {
    const screen = document.getElementById('screen');
    init(screen, formState);

    const root = document.getElementById('root');
    m.mount(root, App);
});
