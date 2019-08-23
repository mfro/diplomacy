import baseArmy from './images/army.png';
import baseFleet from './images/fleet.png';

function transform(url: string) {
    const colors = {
        'England': 'ef6c00',
        'Germany': 'fdd835',
        'France': '3f51b5',
        'Italy': '4caf50',
        'Austria': 'ef5350',
        'Russia': '673ab7',
        'Turkey': '03a9f4',
    };

    function draw(image: HTMLImageElement, color: string) {
        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext('2d')!;
        context.drawImage(image, 0, 0);
        let buffer = context.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < buffer.data.length; i += 4) {
            if (buffer.data[i] == 0xc4 && buffer.data[i + 1] == 0xc4 && buffer.data[i + 1] == 0xc4) {
                buffer.data[i + 0] = parseInt(color.substr(0, 2), 16);
                buffer.data[i + 1] = parseInt(color.substr(2, 2), 16);
                buffer.data[i + 2] = parseInt(color.substr(4, 2), 16);
            }
        }
        context.putImageData(buffer, 0, 0);
        return canvas.toDataURL();
    }

    return new Promise(resolve => {
        let image = new Image();
        image.src = url;
        image.onload = function () {
            let results: any = {};

            for (let key in colors) {
                let icon = draw(image, (colors as any)[key]);
                results[key] = icon;
            }

            resolve(results);
        };
    });
}

Promise.all([
    transform(baseArmy),
    transform(baseFleet),
]).then((data) => {
    Object.assign(army, data[0]);
    Object.assign(fleet, data[1]);
});

export let army = {}, fleet = {};
