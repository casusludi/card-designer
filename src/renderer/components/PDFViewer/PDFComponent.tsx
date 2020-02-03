import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import pdfjs from 'pdfjs-dist';
//@ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { approximateFraction, getOutputScale, roundToDivide, CSS_UNITS } from './PDFUtils';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

//@ts-ignore
const PdfComponent = ({ src }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const fetchPdf = async () => {
            const loadingTask = pdfjs.getDocument(src);

            const pdf = await loadingTask.promise;

            const firstPageNumber = 1;

            const page = await pdf.getPage(firstPageNumber);


            const scale = 1;

            const viewport = page.getViewport({ scale: scale * CSS_UNITS });

            // Prepare canvas using PDF page dimensions
            const canvas: any = canvasRef.current;
            if (canvas) {

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
                const renderTask = page.render(renderContext);

                await renderTask.promise;
            }
        };

        fetchPdf();
    }, [src]);

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
        />
    );
}

PdfComponent.propTypes = {
    src: PropTypes.string
};

PdfComponent.defaultProps = {
    src: `${process.env.PUBLIC_URL}/helloworld.pdf`
};

export default PdfComponent;
