
// Home.jsx - Página principal del sitio, mostrando secciones destacadas y cercanas

import Header from "../components/layout/Header";
import Container from "../components/layout/Container";
import Footer from "../components/layout/Footer";

import NearbySection from "../components/home/NearbySection";
import { FeaturedSection } from "../components/home/FeaturedSection";
import TopCities from "../components/home/TopCities";

export default function Home() {
   return (
      <>
         <Header />
         <Container>
            <NearbySection />
            <FeaturedSection />
            <TopCities />
         </Container>
         <Footer />
      </>
   );
}