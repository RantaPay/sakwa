import { About } from "@/sections/about";
import { Enquiry } from "@/sections/enquiry";
import { Faq } from "@/sections/faq";
import { Footer } from "@/sections/footer";
import { Hero } from "@/sections/hero";
import { HowItWorks } from "@/sections/how-it-works";
import { Invest } from "@/sections/invest";
import { Nav } from "@/sections/nav";
import { Offer } from "@/sections/offer";
import { StoreBand } from "@/sections/store-band";
import { Trust } from "@/sections/trust";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Trust />
        <About />
        <HowItWorks />
        <StoreBand />
        <Offer />
        <Invest />
        <Faq />
        <Enquiry />
      </main>
      <Footer />
    </>
  );
}
