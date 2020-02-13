
// use utils function from https://github.com/mozilla/pdf.js/blob/d6754d1e22fb7b3eb98ace8ce671eac094a4859d/web/ui_utils.js#L258

export const CSS_UNITS = 96.0 / 72.0;

export function getOutputScale(ctx: any) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
    const pixelRatio = devicePixelRatio / backingStoreRatio;
    return {
        sx: pixelRatio,
        sy: pixelRatio,
        scaled: pixelRatio !== 1,
    };
}


export function approximateFraction(x: any) {
    // Fast paths for int numbers or their inversions.
    if (Math.floor(x) === x) {
        return [x, 1];
    }
    const xinv = 1 / x;
    const limit = 8;
    if (xinv > limit) {
        return [1, limit];
    } else if (Math.floor(xinv) === xinv) {
        return [1, xinv];
    }

    const x_ = x > 1 ? xinv : x;
    // a/b and c/d are neighbours in Farey sequence.
    let a = 0,
        b = 1,
        c = 1,
        d = 1;
    // Limiting search to order 8.
    while (true) {
        // Generating next term in sequence (order of q).
        const p = a + c,
            q = b + d;
        if (q > limit) {
            break;
        }
        if (x_ <= p / q) {
            c = p;
            d = q;
        } else {
            a = p;
            b = q;
        }
    }
    let result;
    // Select closest of the neighbours to x.
    if (x_ - a / b < c / d - x_) {
        result = x_ === x ? [a, b] : [b, a];
    } else {
        result = x_ === x ? [c, d] : [d, c];
    }
    return result;
}

export function roundToDivide(x: any, div: any) {
    const r = x % div;
    return r === 0 ? x : Math.round(x - r + div);
}
