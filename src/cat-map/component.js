import m from 'mithril';

import { init } from './index';
import Dev from '../components/Dev';

class CatMap {

    oninit() {
        this.plotter = init('#plotter');
        this.plotter.plot();

        this.formState = this.plotter.getState();
    }

    view() {
        const { plotter } = this;

        return m('form', { className: 'mui-form' }, [
            m(Dev, {
                data: {
                    plotter: plotter.getState(),
                }
            }),
        ]);
    }
}

export default CatMap;
