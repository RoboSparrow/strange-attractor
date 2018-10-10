/* global m */
import StrangeAttractor from './components/StrangeAttractor';
import HenonMap from './components/HenonMap';
import GingerbreadmanMap from './components/GingerbreadmanMap';

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

const Menu = {
    view: function() {
        return m('nav', { className: 'mui-panel' }, [
            m(Button, { href: '/', title: 'Home' }),
            m(Button, { href: '/strange-attractor', title: 'Strange Attractor' }),
            m(Button, { href: '/henon-map', title: 'Henon Map' }),
            m(Button, { href: '/gingerbreadman-map', title: 'Gingerbreadman Map' }),
        ]);
    },
};

document.addEventListener('DOMContentLoaded', () => {

    const screen = document.getElementById('screen');
    const root = document.getElementById('root');

    m.route(root, '/strange-attractor', {

        '/strange-attractor': {
            render: function() {
                return [
                    m(Menu),
                    m(StrangeAttractor, { screen }),
                ];
            }
        },

        '/henon-map': {
            render: function() {
                return [
                    m(Menu),
                    m(HenonMap, { screen }),
                ];
            }
        },

        '/gingerbreadman-map': {
            render: function() {
                return [
                    m(Menu),
                    m(GingerbreadmanMap, { screen }),
                ];
            }
        },

    });

});
