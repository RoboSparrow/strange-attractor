const id = 'screen-canvas';

export default function(container = document.body, width = 550, height = 400) {

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
}
