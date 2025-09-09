import Navbar from "@/components/Landingpage/Navbar";
import Hero from "@/components/Landingpage/Hero";
import AITools from "@/components/Landingpage/AITools";
import Testimonial from "@/components/Landingpage/Testimonial";
import Footer from "@/components/Landingpage/Footer";


export default function LandPage() {
  return (
    <>
      <div >
        <Navbar />
        <Hero />
        <AITools />
        <Testimonial />
        <Footer />
      </div>
    
    </>
  );
}
