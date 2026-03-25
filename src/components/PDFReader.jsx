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
    const [isScrolling, setIsScrolling] = useState(false);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

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

    const goToPrevPage = () => {
        setDirection(-1);
        setPageNumber(prev => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setDirection(1);
        setPageNumber(prev => Math.min(prev + 1, numPages));
    };

    // Handle horizontal scroll (trackpad/mouse wheel)
    useEffect(() => {
        const handleWheel = (e) => {
            // Check if horizontal delta is significant
            if (Math.abs(e.deltaX) > 30 && !isScrolling) {
                setIsScrolling(true);
                
                if (e.deltaX > 0) {
                    goToNextPage();
                } else {
                    goToPrevPage();
                }

                // Cooldown to prevent rapid page turns
                setTimeout(() => {
                    setIsScrolling(false);
                }, 1000); 
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [numPages, isScrolling]);

    const handleSwipe = (event, info) => {
        // Swipe left (negative x offset) -> Next page
        // Swipe right (positive x offset) -> Previous page
        if (info.offset.x > 50) goToPrevPage();
        else if (info.offset.x < -50) goToNextPage();
    };

    const handleTap = (e) => {
        // Only trigger if clicking on the page container, not on toolbar or other buttons
        if (e.target.closest('.pdf-toolbar') || e.target.closest('.pdf-nav') || e.target.closest('.pdf-progress')) {
            return;
        }

        const width = window.innerWidth;
        const x = e.clientX;

        if (x < width / 3) {
            goToPrevPage();
        } else if (x > (width * 2) / 3) {
            goToNextPage();
        }
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

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
        }),
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
            <div className="pdf-content" onClick={handleTap} style={{ touchAction: 'none' }}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={pageNumber}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ 
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
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
