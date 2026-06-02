import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const slides = [
  { src: "/images/swiper/5.jpeg", alt: "Al-Sadat Pigeon Club" },
  { src: "/images/swiper/5.jpeg", alt: "Al-Sadat Pigeon Club" },
  { src: "/images/swiper/5.jpeg", alt: "Al-Sadat Pigeon Club" },
];

export default function HeroBanner() {
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
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full object-cover"
              style={{ maxHeight: "520px", minHeight: "200px" }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}