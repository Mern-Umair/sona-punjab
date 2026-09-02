import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import TournamentSection from "./components/TournamentSection";
import ClubTournaments from "./components/ClubTournaments";
import Headline from "./components/Headline";
import { useParams } from "react-router-dom";

function ClubPage() {
  const { clubId } = useParams();
  return (
    <div className="bg-light min-h-screen flex flex-col">
      <HeroBanner />
      <Navbar />
      <Headline />
      <ClubTournaments clubId={clubId} />
    </div>
  );
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={
        <div className="bg-light min-h-screen flex flex-col">
          <HeroBanner />
          <Navbar />
          <Headline />
          <TournamentSection />
        </div>
      } />
      <Route path="/club/:clubId" element={<ClubPage />} />
      <Route path="/results/:id" element={
        <div className="bg-light min-h-screen flex flex-col">
          <HeroBanner />
          <Navbar />
          <Headline />
          <TournamentSection />
        </div>
      } />
    </Routes>
  );
};

export default App;