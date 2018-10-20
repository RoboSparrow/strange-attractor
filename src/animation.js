// todo stateprovider
const _defaults = Object.freeze({
    fps: -1, // no throttling
    count: 0,
});

class Animation {
    constructor() {
        this.requestId = -1;
        this.prev = 0;
        this.running = false;
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
        this.running = false;
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
        return this;
    }

    play() {
        this.running = true;
        this.requestId = requestAnimationFrame(() => this.loop());
        return this;
    }

    pause(seconds) { //TODO improve
        this.stop();

        let id = null;
        id = setInterval(() => {
            this.play();
            clearInterval(id);
        }, seconds * 1000);

        return this;
    }

    loop() {
        const { prev, callbacks } = this;

        if (!this.running) {
            return;
        }

        const { fps } = this.state;
        const now = Date.now();
        const delta = now - prev; //msec

        if (!fps || (fps > 0 && delta >= 1000 / fps)) {
            let i;
            const { length } = callbacks;
            for (i = 0; i < length; i += 1) {
                callbacks[i]();
            }

            this.prev = now;
            this.state.count += 1;
        }

        this.requestId = requestAnimationFrame(() => this.loop());
    }

}

const animation = new Animation();

export default animation;
