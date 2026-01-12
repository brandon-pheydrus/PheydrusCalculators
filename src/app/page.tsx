import Link from "next/link";

const calculators = [
  { name: "Feng Shui Flying Star Calculator", description: "Analyze your home's flying star chart with period and year comparisons" },
  { name: "Numerology Calculator", description: "Calculate life path numbers, personal year, and address numerology" },
  { name: "Astrology Natal Chart", description: "Generate detailed natal charts with planet positions and aspects" },
  { name: "Transit Calculator", description: "Track planetary transits through your houses by rising sign" },
  { name: "Relocation Analysis", description: "Discover how different locations affect your astrological chart" },
];

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Pheydrus Tools</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mb-8">
        Professional calculators for Astrology, Numerology, and Feng Shui.
      </p>

      <div className="w-full max-w-2xl mb-12">
        <h2 className="text-xl font-semibold mb-6 text-slate-700 dark:text-slate-300">Available Calculators</h2>
        <div className="grid gap-4">
          {calculators.map((calc) => (
            <div
              key={calc.name}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-left"
            >
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{calc.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{calc.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Link
          href="https://pheydrus.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-md font-semibold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
        >
          Visit Pheydrus.com
        </Link>
        <p className="mt-4 text-sm text-slate-500">
          Purchase access to these tools through our main website.
        </p>
      </div>
    </div>
  );
};

export default Page;
