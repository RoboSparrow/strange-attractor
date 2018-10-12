import m from 'mithril';

const Dev = {
    view: vnode => m('pre', { style: 'font-size: 0.8em;' }, `${JSON.stringify(vnode.attrs.data, null, 4)}`)
};

export default Dev;
