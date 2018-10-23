import m from 'mithril';

import './main.css';

import StrangeAttractor from './components/StrangeAttractor';
import LorenzAttractor from './components/LorenzAttractor';
import HenonMap from './components/HenonMap';
import LogisticMap from './components/LogisticMap';
import IdekaMap from './components/IdekaMap';
import GingerbreadmanMap from './components/GingerbreadmanMap';
import SprottsQuadraticMaps from './components/SprottsQuadraticMaps';
import CatMap from './cat-map/component';
// import RoesslerAttractor from './roessler-attractor/component';

const Button = {
    view: function(vnode) {
        const { href, title } = vnode.attrs;
        const current = m.route.get();

        const cls = (current === href) ? 'mui-btn--accent' : 'mui-btn--primary';
        return m('a', {
            href,
            oncreate: m.route.link,
            className: `mui-btn mui-btn--small ${cls}`,
        }, title);
    },

};

class Menu {
    view () {
        return m('nav', { className: 'mui-panel' }, [
            m(Button, { href: '/', title: 'Home' }),
            m(Button, { href: '/strange-attractor', title: 'Strange Attractor' }),
            m(Button, { href: '/lorenz-attractor', title: 'Lorenz Attractor' }),
            m(Button, { href: '/henon-map', title: 'Henon Map' }),
            m(Button, { href: '/logistic-map', title: 'Logistic Map' }),
            m(Button, { href: '/ideka-map', title: 'Ideka Map' }),
            m(Button, { href: '/gingerbreadman-map', title: 'Gingerbreadman Map' }),
            m(Button, { href: '/sprotts-quadratic-maps', title: 'Sprott\'s Quadratic Maps' }),
            // m(Button, { href: '/roessler-attractor', title: 'Roessler Attractor' }),
            m(Button, { href: '/cat-map', title: 'Arnold\'s Cat Map' }),
        ]);
    }
}

const masonry = function(leftComponent, rightComponent) {
    return {
        view: () => m('main', [
            m('header', m(Menu)),
            m('main.mui-container-fluid', [
                m('.mui-col-md-6', m(leftComponent)),
                m('.mui-col-md-6', m(rightComponent)),
            ]),
            m('footer'),
        ]),
    };
};

// document.addEventListener('DOMContentLoaded', () => {
const root = document.body;

m.route(root, '/strange-attractor', {
    '/strange-attractor': masonry('#plotter', StrangeAttractor),
    '/lorenz-attractor': masonry('#plotter', LorenzAttractor),
    '/henon-map': masonry('#plotter', HenonMap),
    '/logistic-map': masonry('#plotter', LogisticMap),
    '/ideka-map': masonry('#plotter', IdekaMap),
    '/gingerbreadman-map': masonry('#plotter', GingerbreadmanMap),
    '/sprotts-quadratic-maps': masonry('#plotter', SprottsQuadraticMaps),
    // '/roessler-attractor': masonry('#plotter', RoesslerAttractor),
    '/cat-map': masonry('#plotter', CatMap),
});

// });
