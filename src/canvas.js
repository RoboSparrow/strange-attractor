const id = 'screen-canvas';

class Context2d {
    constructor(ctx) {
        if (ctx.tagName === 'CANVAS') {
            ctx = ctx.getContext('2d');
        }
        this.ctx = ctx;
        return this;
    }

    fill(color = null, x = 0, y = 0, width = -1, height = -1) {
        const { ctx } = this;

        ctx.save();
        ctx.fillStyle = color;
        if (width < 0) {
            ({ width } = ctx.canvas);
        }
        if (height < 0) {
            ({ height } = ctx.canvas);
        }
        ctx.fillRect(x, y, width, height);
        ctx.restore();

        return this;
    }

    clear(color = '') {
        const { ctx } = this;

        const { width, height } = ctx.canvas;

        ctx.save();
        if (color) {
            ctx.fillStyle = color;
        }
        ctx.fillRect(0, 0, width, height);
        //ctx.restore();

        return this;
    }

    progress(message, color = '', bgColor = '') {
        const { ctx } = this;
        const { width, height } = ctx.canvas;

        ctx.save();

        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (bgColor) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
        }

        if (color) {
            ctx.fillStyle = color;
        }
        ctx.fillText(message, width / 2, height / 2);
        ctx.restore();

        return this;
    }

}

const initCanvas = function(container = document.body, width = 550, height = 400) {

    if (typeof container === 'string') {
        container = document.querySelector(container);
    }

    const exists = document.getElementById(id);
    if (exists) {
        container.removeChild(exists);
    }

    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = width;
    canvas.height = height;

    container.appendChild(canvas);

    return canvas;
};

const contextHelper = function(ctx) {
    return new Context2d(ctx);
};

export { initCanvas as default, contextHelper };
