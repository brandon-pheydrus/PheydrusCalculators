"use client";
import { ReactNode, useState } from "react";
import Container from "../components/container";
import {
  AstrologyAspect,
  AstrologyPlanet,
  findRisingSign,
} from "./constants";
import { getAspectsByPlanet } from "./utils";
import { calculateNatalChart, NatalChartResult } from "@/lib/astro/natalChart";

const planetBadgeColors = [
  "bg-indigo-100 text-indigo-900",
  "bg-emerald-100 text-emerald-900",
  "bg-amber-100 text-amber-900",
  "bg-sky-100 text-sky-900",
  "bg-rose-100 text-rose-900",
  "bg-purple-100 text-purple-900",
];
const signBadgeColors = [
  "bg-blue-100 text-blue-900",
  "bg-lime-100 text-lime-900",
  "bg-orange-100 text-orange-900",
  "bg-teal-100 text-teal-900",
  "bg-pink-100 text-pink-900",
  "bg-violet-100 text-violet-900",
];

const createColorMap = (items: string[], palette: string[]) => {
  const map: Record<string, string> = {};
  let index = 0;
  items
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item))
    .forEach((item) => {
      if (!map[item]) {
        map[item] = palette[index % palette.length];
        index += 1;
      }
    });
  return map;
};

const Astrology = () => {
  const [birthDetails, setBirthDetails] = useState({
    dob: "",
    time: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chartData, setChartData] = useState<NatalChartResult | null>(null);

  const handleChange =
    (field: keyof typeof birthDetails) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBirthDetails((previous) => ({
        ...previous,
        [field]: event.target.value,
      }));
    };

  const requestNatalChart = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!birthDetails.dob || !birthDetails.time) {
      setErrorMessage("Please provide both date and time of birth.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setChartData(null);

    try {
      const [year, month, date] = birthDetails.dob
        .split("-")
        .map((value) => Number(value));
      const [hours, minutes] = birthDetails.time
        .split(":")
        .map((value) => Number(value));

      if (
        [year, month, date, hours, minutes].some((value) => Number.isNaN(value))
      ) {
        throw new Error("Unable to parse birth date or time.");
      }

      // Use Swiss Ephemeris (client-side, unlimited, no API key needed)
      const data = await calculateNatalChart({
        year,
        month,
        date,
        hours,
        minutes,
        seconds: 0,
        latitude: 17.38405,  // TODO: Get from location input
        longitude: 78.45636, // TODO: Get from location input
        timezone: 5.5,       // TODO: Get from location input
      });

      setChartData(data);
      console.log({ data });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong calculating the chart."
      );
    } finally {
      setLoading(false);
    }
  };

  // Use chart data if available, otherwise show empty state
  const planets = chartData?.planets.output ?? [];
  const aspects = chartData?.aspects.output ?? [];

  const planetColorMap = createColorMap(
    [
      ...planets.map((planet) => planet.planet.en),
      ...aspects.flatMap((aspect) => [aspect.planet_1.en, aspect.planet_2.en]),
    ],
    planetBadgeColors
  );
  const signColorMap = createColorMap(
    planets.map((planet) => planet.zodiac_sign.name.en),
    signBadgeColors
  );

  const hasValues = Object.values(birthDetails).some((value) => value.trim());

  return (
    <div className="w-full flex flex-col p-1 justify-center pb-32">
      <h1 className="text-xl text-center py-8 font-extrabold uppercase">
        Astrology
      </h1>
      <div className="m-auto w-full lg:w-2/3 p-4 space-y-8">
        <Container>
          <Banner>Birth Information</Banner>
          <form
            className="w-full rounded p-4 dark:text-white space-y-4"
            onSubmit={requestNatalChart}
          >
            <div className="grid sm:grid-cols-2 md:grid-cols-3 m-auto">
              <InputField
                label="Date of Birth"
                value={birthDetails.dob}
                onChange={handleChange("dob")}
                type="date"
                example="Select your birth date"
              />
              <InputField
                label="Time of Birth"
                value={birthDetails.time}
                onChange={handleChange("time")}
                type="time"
                example="HH:MM"
              />
              <InputField
                label="Place of Birth"
                value={birthDetails.location}
                onChange={handleChange("location")}
                type="text"
                example="City, Country"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Fetching chart...
                </span>
              ) : (
                "Generate Natal Chart"
              )}
            </button>
          </form>
          {hasValues ? (
            <div className="rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-500 border-slate-700 p-4 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                DOB: {birthDetails.dob || "—"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Time: {birthDetails.time || "—"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Location: {birthDetails.location || "—"}
              </p>
            </div>
          ) : (
            <p className="text-xs text-center p-4 opacity-80">
              Fill in your birth details to get started.
            </p>
          )}
          {errorMessage ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          ) : null}
          {chartData && planets.length > 0 && (
            <>
              <Planets
                planets={planets}
                planetColorMap={planetColorMap}
                signColorMap={signColorMap}
              />
              <Aspects
                aspects={aspects}
                birthDate={birthDetails.dob}
                birthTime={birthDetails.time}
              />
            </>
          )}
          {!chartData && !loading && (
            <p className="text-sm text-center text-slate-500 py-8">
              Enter your birth details and click &quot;Generate Natal Chart&quot; to see your chart.
            </p>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Astrology;

const Planets = ({
  planets,
  planetColorMap,
  signColorMap,
}: {
  planets: AstrologyPlanet[];
  planetColorMap: Record<string, string>;
  signColorMap: Record<string, string>;
}) => {
  const sortedPlanets = [...planets].sort((a, b) =>
    a.zodiac_sign.name.en.localeCompare(b.zodiac_sign.name.en)
  );
  const rising = findRisingSign(planets);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Planets</h2>
      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2 text-left">Planet</th>
              <th className="px-4 py-2 text-left">Sign</th>
              {/* <th className="px-4 py-2 text-left">Degree</th> */}
              <th className="px-4 py-2 text-left">House</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlanets.map((planet) => (
              <tr
                key={planet.planet.en}
                className="border-t border-slate-200 dark:border-slate-700"
              >
                <td className="px-4 py-2">
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                      planetColorMap[planet.planet.en] ??
                      "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {planet.planet.en}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-xs font-semibold ${
                      signColorMap[planet.zodiac_sign.name.en] ??
                      "bg-slate-100 text-slate-900"
                    }`}
                  >
                    {planet.zodiac_sign.name.en}
                  </span>
                </td>
                {/* <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  {Number(planet.normDegree).toFixed(0)}
                </td> */}
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  {/* {planet.zodiac_sign.number} */}
                  {/* {houseIndexByRisingSign(rising, planet.zodiac_sign.name.en)} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Aspects = ({
  aspects,
  birthDate,
  birthTime,
}: {
  aspects: AstrologyAspect[];
  birthDate: string;
  birthTime: string;
}) => {
  const icaspects = getAspectsByPlanet(aspects, "IC", "Conjunction");
  const dscaspects = getAspectsByPlanet(aspects, "DSC", "Conjunction");
  const ascaspects = getAspectsByPlanet(aspects, "ASC", "Conjunction");
  const mc_aspects = getAspectsByPlanet(aspects, "MC", "Conjunction");
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">IC Aspects</h2>
      {icaspects.map((aspect) => (
        <Aspect
          key={`${aspect.planet_1.en}-${aspect.planet_2.en}`}
          aspect={aspect}
        />
      ))}
      <h2 className="text-lg font-bold mb-4">DSC Aspects</h2>
      {dscaspects.map((aspect) => (
        <Aspect
          key={`${aspect.planet_1.en}-${aspect.planet_2.en}`}
          aspect={aspect}
        />
      ))}
      <h2 className="text-lg font-bold mb-4">MC Aspects</h2>
      {mc_aspects.map((aspect) => (
        <Aspect
          key={`${aspect.planet_1.en}-${aspect.planet_2.en}`}
          aspect={aspect}
        />
      ))}
      <h2 className="text-lg font-bold mb-4">ASC Aspects</h2>
      {ascaspects.map((aspect) => (
        <Aspect
          key={`${aspect.planet_1.en}-${aspect.planet_2.en}`}
          aspect={aspect}
        />
      ))}
      {/* <Astrocartography birthDate={birthDate} birthTime={birthTime} /> */}
    </div>
  );
};

const Aspect = ({ aspect }: { aspect: AstrologyAspect }) => {
  return (
    <div>
      <p>
        {aspect.planet_1.en} {aspect.aspect.en} {aspect.planet_2.en}
      </p>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
  type,
  example,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  example: string;
}) => (
  <div className="p-4">
    <label className="text-xs text-slate-400 absolute bg-white px-1 rounded dark:bg-slate-800 dark:text-white">
      {label}
    </label>
    <input
      className="rounded-md p-2 mt-2 border border-slate-200 dark:text-white dark:bg-slate-900 w-full"
      type={type}
      value={value}
      onChange={onChange}
    />
    <p className="text-xs opacity-75 text-slate-500 p-0.5">{example}</p>
  </div>
);

const Banner = ({ children }: { children: ReactNode }) => (
  <div className="text-center text-lg rounded-t-lg p-4 text-slate-900 dark:text-slate-100 font-bold">
    {children}
  </div>
);

// TODO: Handroll this image or use @astrodraw/astrochart
const AstrologyChartDisplay = ({ source }: { source: string }) => {
  const trimmed = source.trim();
  const isSvgMarkup = trimmed.startsWith("<svg");
  if (isSvgMarkup) {
    return (
      <div
        className="min-w-[320px]"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    );
  }

  return (
    <img
      src={source}
      alt="Natal wheel chart"
      className="min-w-[320px]"
      loading="lazy"
    />
  );
};

const LoadingSpinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);
