import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Container from "../components/layout/Container";
import { SearchDropdown } from "../components/search/SearchDropdown";
import NearbySection from "./home/NearbySection";
import { FeaturedSection } from "./home/FeaturedSection";
import TopCities from "./home/TopCities";
import QuickFilters from "./home/QuickFilters";
import HowItWorks from "./home/HowItWorks";
import HostCTA from "./home/HostCTA";

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header showSearch={false} />

      <Container className="max-w-5xl p-0 pb-8">
        <section
          className="px-4 pt-3 lg:pt-4"
          aria-labelledby="home-hero-title"
        >
          <div className="relative z-40 rounded-3xl border border-neutral-800 bg-neutral-950/85 px-4 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)] sm:px-5 lg:px-7">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-500/15 blur-3xl" />
              <div className="absolute -bottom-16 left-4 h-28 w-28 rounded-full bg-orange-500/10 blur-2xl" />
            </div>

            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-300/90">
                Tu ruta de tapas empieza aquí
              </p>
              <h2
                id="home-hero-title"
                className="mt-2 text-2xl font-black leading-tight text-white lg:text-[2rem]"
              >
                Descubre locales y tapas cerca de ti
              </h2>
              <p className="mt-2 text-sm text-neutral-300">
                Busca por nombre y salta directo a los sitios mejor valorados.
              </p>

              <div className="mt-4">
                <SearchDropdown placeholder="Busca locales, tapas o zonas..." />
              </div>

              <QuickFilters onNavigate={navigate} />
            </div>
          </div>
        </section>

        <NearbySection />
        <FeaturedSection className="mt-10" />
        <TopCities className="mt-10" />

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5 xl:gap-8">
          <div className="xl:col-span-3">
            <HowItWorks className="mt-0" />
          </div>
          <div className="xl:col-span-2">
            <HostCTA className="mt-0" />
          </div>
        </div>
      </Container>
    </>
  );
};
