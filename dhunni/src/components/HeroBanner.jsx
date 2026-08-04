import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useEffect, useState } from "react";
import { useGetBannersQuery } from "../../redux/api/bannerApi";

export default function HeroBanner() {
  const [bannerImages, setBannerImages] = useState([]);
  const { data, isLoading } = useGetBannersQuery();

  useEffect(() => {
    if (data?.data) {
      setBannerImages(data.data);
    }
  }, [data]);

  if (isLoading || bannerImages.length === 0) return null;

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        allowTouchMove={false}
        simulateTouch={false}
        className="w-full"
      >
        {bannerImages.map((banner) => (
          <SwiperSlide key={banner._id}>
            <img
              src={banner.imageUrl}
              alt="Sona Punjab Banner"
              className="w-full object-cover"
              style={{ maxHeight: "520px", minHeight: "200px" }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}