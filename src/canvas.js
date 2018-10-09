const id = 'screen-canvas';

export default function(container, width = 550, height = 400) {

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
