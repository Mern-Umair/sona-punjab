export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy mt-1 sm:mt-10">
      <div className="max-w-7xl mx-auto px-4 py-2 text-center">
        <p className="text-blue-200 text-[11px] sm:text-xs font-sans">
          Copyright © {currentYear} Sona Punjab Pigeon Tournaments
        </p>
      </div>
    </footer>
  );
}