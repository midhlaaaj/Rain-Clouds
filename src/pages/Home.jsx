import HeroSection from '../components/HeroSection';
import AboutAuthor from '../components/AboutAuthor';
import ReviewsSection from '../components/ReviewsSection';
import WriteReviewSection from '../components/WriteReviewSection';
import CTASection from '../components/CTASection';

export default function Home() {
    return (
        <>
            <HeroSection />
            <AboutAuthor />
            <ReviewsSection />
            <WriteReviewSection />
            <CTASection />
        </>
    );
}
