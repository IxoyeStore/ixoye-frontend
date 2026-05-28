import CarouselTextBanner from "@/components/carousel-text-banner";
import FeaturedProducts from "@/components/featured-products";
import BannerDiscount from "@/components/banner-discount";
import ChooseCategory from "@/components/choose-category";
import InfoCards from "@/components/info-cards";
import ShipmentSection from "@/components/shipment";
import RecentlyViewedSection from "@/components/recently-viewed/section";

export default function Home() {
  return (
    <main>
      <CarouselTextBanner />
      <InfoCards />
      <FeaturedProducts />
      <ChooseCategory />
      <RecentlyViewedSection />
      <ShipmentSection />
      <BannerDiscount />
    </main>
  );
}
