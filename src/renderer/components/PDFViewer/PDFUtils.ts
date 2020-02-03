import pdfjs from 'pdfjs-dist';
//@ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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

export const fetchPDFDocument = async (src:String) => {
    const loadingTask = pdfjs.getDocument(src);

    const pdf = await loadingTask.promise;

    return {
        async render(canvas:HTMLCanvasElement,pageIndex:number,scale:number=1){

            const page = await pdf.getPage(pageIndex);
            const viewport = page.getViewport({ scale: scale * CSS_UNITS });
        
            // Use the viewport calculation from https://github.com/mozilla/pdf.js/blob/d6754d1e22fb7b3eb98ace8ce671eac094a4859d/web/pdf_page_view.js#L589
            // for a better rendering
        
            const ctx = canvas.getContext("2d", { alpha: false });
            const outputScale = getOutputScale(ctx);
        
            const sfx = approximateFraction(outputScale.sx);
            const sfy = approximateFraction(outputScale.sy);
            canvas.width = roundToDivide(viewport.width * outputScale.sx, sfx[0]);
            canvas.height = roundToDivide(viewport.height * outputScale.sy, sfy[0]);
            canvas.style.width = roundToDivide(viewport.width, sfx[1]) + "px";
            canvas.style.height = roundToDivide(viewport.height, sfy[1]) + "px";
        
        
            // Rendering area
            const transform = !outputScale.scaled
                ? null
                : [outputScale.sx, 0, 0, outputScale.sy, 0, 0];
            const renderContext = {
                canvasContext: ctx,
                transform,
                viewport: viewport,
                enableWebGL: false,
                renderInteractiveForms: false,
            };
        
            //@ts-ignore
            const renderTask = page.render(renderContext);
        
            await renderTask.promise;
        }
    }

};