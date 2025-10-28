import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const BlogTest = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Blog Test Page</h1>
        <p>This is a simple test blog page to check if routing works.</p>
      </div>
      <Footer />
    </div>
  );
};

export default BlogTest;
