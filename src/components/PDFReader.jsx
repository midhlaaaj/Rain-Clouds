import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bookmark, X, Maximize2, Minimize2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PDFReader.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFReader({ file = '/ebook.pdf', onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Load bookmark on mount
    useEffect(() => {
        const savedPage = localStorage.getItem('ebook_last_page');
        if (savedPage) {
            setPageNumber(parseInt(savedPage, 10));
            setIsBookmarked(true); // Treat resumed page as bookmarked
        }
    }, []);

    const toggleBookmark = () => {
        if (isBookmarked) {
            localStorage.removeItem('ebook_last_page');
            setIsBookmarked(false);
        } else {
            localStorage.setItem('ebook_last_page', pageNumber.toString());
            setIsBookmarked(true);
            alert(`Bookmark saved at Page ${pageNumber}!`);
        }
    };

    // Update isBookmarked state when page changes
    useEffect(() => {
        const savedPage = localStorage.getItem('ebook_last_page');
        if (savedPage && parseInt(savedPage, 10) === pageNumber) {
            setIsBookmarked(true);
        } else {
            setIsBookmarked(false);
        }
    }, [pageNumber]);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages));

    const handleSwipe = (event, info) => {
        if (info.offset.x > 100) goToPrevPage();
        else if (info.offset.x < -100) goToNextPage();
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div className={`pdf-reader ${isFullscreen ? 'pdf-reader--fullscreen' : ''}`}>
            {/* Toolbar */}
            <div className="pdf-toolbar">
                <button className="pdf-toolbar__btn" onClick={onClose}>
                    <X size={20} />
                </button>
                <div className="pdf-toolbar__info">
                    Page {pageNumber} of {numPages}
                </div>
                <div className="pdf-toolbar__actions">
                    <button 
                        className={`pdf-toolbar__btn ${isBookmarked ? 'pdf-toolbar__btn--active' : ''}`}
                        onClick={toggleBookmark}
                        title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                    >
                        <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <button className="pdf-toolbar__btn" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="pdf-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pageNumber}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onPanEnd={handleSwipe}
                        className="pdf-page-container"
                    >
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={<div className="pdf-loading">Loading Ebook...</div>}
                        >
                            <Page 
                                pageNumber={pageNumber} 
                                scale={scale} 
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            />
                        </Document>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows (Desktop) */}
                <button 
                    className="pdf-nav pdf-nav--prev" 
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                >
                    <ChevronLeft size={32} />
                </button>
                <button 
                    className="pdf-nav pdf-nav--next" 
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Bottom Progress */}
            <div className="pdf-progress">
                <div 
                    className="pdf-progress__bar" 
                    style={{ width: `${(pageNumber / numPages) * 100}%` }} 
                />
            </div>
        </div>
    );
}
