import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import TournamentSection from "./components/TournamentSection";

const App = () => {
  return (
    <div className="bg-light min-h-screen flex flex-col">
      <Navbar />
      <HeroBanner />

      {/* Scrolling Headline */}
      <div className="overflow-hidden py-2 bg-white border-b border-gray">
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-dark font-sans text-xs sm:text-sm px-8">
            خوش آمدید — سونا پنجاب میں آپ کو خوش آمدید کہا جاتا ہے، تمام امیدواروں کے لیے نیک تمنائیں، جبکہ کمیٹی کی تازہ اپڈیٹس اور آفرز یہاں ظاہر ہوتی رہیں گی۔
          </span>
          <span className="text-dark font-sans text-xs sm:text-sm px-8">
            خوش آمدید — سونا پنجاب میں آپ کو خوش آمدید کہا جاتا ہے، تمام امیدواروں کے لیے نیک تمنائیں، جبکہ کمیٹی کی تازہ اپڈیٹس اور آفرز یہاں ظاہر ہوتی رہیں گی۔
          </span>
        </div>
      </div>

      <TournamentSection />
    </div>
  );
};

export default App;