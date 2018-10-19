// todo stateprovider
const _defaults = Object.freeze({
    fps: 32,
    count: 0,
});

class Animation {
    constructor() {
        this.requestId = -1;
        this.prev = 0;
        this.state = Object.assign({}, _defaults);
        this.callbacks = [];
    }

    setState(options) {
        Object.assign(this.state, options);
        return this;
    }

    getState() {
        return Object.assign({}, this.state);
    }

    throttle(fps) {
        this.setState({ fps });
        return this;
    }

    assign(fn) {
        this.callbacks.push(fn);
        return this;
    }

    stop() {
        const { requestId } = this;

        if (requestId > 0) {
            cancelAnimationFrame(requestId);
        }
        this.requestId = -1;

        return this;
    }

    play() {
        this.requestId = requestAnimationFrame(this.loop.bind(this));
        return this;
    }

    loop() {
        const { requestId, prev, callbacks } = this;

        if (requestId === -1) {
            return;
        }

        const { fps } = this.state;
        const now = Date.now();
        const delta = now - prev; //msec

        if (fps > 0 && delta >= 1000 / fps) {
            let i;
            const { length } = callbacks;
            for (i = 0; i < length; i += 1) {
                callbacks[i]();
            }

            this.prev = now;
            this.state.count += 1;
        }

        this.requestId = requestAnimationFrame(this.loop.bind(this));
    }

}

const animation = new Animation();

export default animation;
