import { useNavigate } from 'react-router-dom';
import PDFReader from '../components/PDFReader';

export default function PDFReaderPage() {
    const navigate = useNavigate();

    return (
        <div className="pdf-page-wrapper" style={{ minHeight: '100vh', background: '#0f172a' }}>
            <PDFReader 
                file="/ebook.pdf" 
                onClose={() => navigate('/dashboard')} 
            />
        </div>
    );
}
