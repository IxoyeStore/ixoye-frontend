import CarouselTextBanner from "@/components/carousel-text-banner";
import FeaturedProducts from "@/components/featured-products";
import BannerDiscount from "@/components/banner-discount";
import ChooseCategory from "@/components/choose-category";
import InfoCards from "@/components/info-cards";
import BannerProduct from "@/components/banner-product";

export default function Home() {
  return (
    <main>
      <CarouselTextBanner />
      <FeaturedProducts />
      <InfoCards />
      <ChooseCategory />
      <BannerDiscount />
      {/* <BannerProduct /> */}
      {/* Envios hechos */}
      {/* Respaldo clientes */}
    </main>
  );
}
