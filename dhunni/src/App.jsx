import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import TournamentSection from "./components/TournamentSection";
import Headline from "./components/Headline";

const App = () => {
  return (
    <div className="bg-light min-h-screen flex flex-col">
      <Navbar />
      <HeroBanner />

      <Headline/>

      <TournamentSection />
    </div>
  );
};

export default App;