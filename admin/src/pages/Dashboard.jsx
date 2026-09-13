import welcomeImg from "../assets/welcome.jpg";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-[#122654] font-bold text-xl">Dashboard</h2>
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
        <img
          src={welcomeImg}
          alt="خوش آمدید سوہنا پنجاب"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
