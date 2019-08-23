export function error(msg: string) {
    debugger;
    return new Error(msg);
}

export function* matches(regex: RegExp, target: string) {
    let copy = new RegExp(regex, 'g');
    let match;
    while (match = copy.exec(target))
        yield match;
}
