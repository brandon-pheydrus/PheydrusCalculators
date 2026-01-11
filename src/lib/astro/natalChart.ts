// Client-side natal chart calculations using Swiss Ephemeris WASM
// No API key needed - unlimited calculations

import type { AstrologyPlanet, AstrologyAspect } from "@/app/astro/constants";

type Planet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

const ZODIAC_SIGNS: ZodiacSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

// Aspect definitions with orbs
const ASPECTS = [
  { name: "Conjunction", angle: 0, orb: 8 },
  { name: "Opposition", angle: 180, orb: 8 },
  { name: "Trine", angle: 120, orb: 8 },
  { name: "Square", angle: 90, orb: 7 },
  { name: "Sextile", angle: 60, orb: 6 },
] as const;

/**
 * Convert ecliptic longitude (0-360) to zodiac sign
 */
export const degreeToZodiacSign = (degree: number): { sign: ZodiacSign; signNumber: number; normDegree: number } => {
  const normalized = ((degree % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const normDegree = normalized % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    signNumber: signIndex + 1, // 1-12
    normDegree,
  };
};

/**
 * Calculate the angular distance between two points (0-180)
 */
const angularDistance = (deg1: number, deg2: number): number => {
  const diff = Math.abs(deg1 - deg2) % 360;
  return diff > 180 ? 360 - diff : diff;
};

/**
 * Check if two planets form an aspect
 */
const findAspect = (
  deg1: number,
  deg2: number
): { name: string; angle: number } | null => {
  const distance = angularDistance(deg1, deg2);

  for (const aspect of ASPECTS) {
    if (Math.abs(distance - aspect.angle) <= aspect.orb) {
      return { name: aspect.name, angle: aspect.angle };
    }
  }
  return null;
};

/**
 * Format planet data to match API response structure
 */
const formatPlanet = (
  name: string,
  longitude: number,
  isRetro: boolean = false
): AstrologyPlanet => {
  const { sign, signNumber, normDegree } = degreeToZodiacSign(longitude);
  return {
    planet: { en: name },
    fullDegree: longitude,
    normDegree,
    isRetro: isRetro ? "True" : "False",
    zodiac_sign: {
      number: signNumber,
      name: { en: sign },
    },
  };
};

export type NatalChartInput = {
  year: number;
  month: number;
  date: number;
  hours: number;
  minutes: number;
  seconds?: number;
  latitude: number;
  longitude: number;
  timezone: number; // Offset in hours (e.g., 5.5 for IST)
};

export type NatalChartResult = {
  planets: {
    statusCode: number;
    output: AstrologyPlanet[];
  };
  aspects: {
    statusCode: number;
    output: AstrologyAspect[];
  };
};

/**
 * Calculate natal chart using Swiss Ephemeris WASM
 * Must be called from client-side only
 */
export const calculateNatalChart = async (
  input: NatalChartInput
): Promise<NatalChartResult> => {
  if (typeof window === "undefined") {
    throw new Error("calculateNatalChart must be called from client-side only");
  }

  // Lazy-load ephemeris
  const { initEphemeris, getPlanetLongitudes, getAngles } = await import(
    "@/lib/astro/ephemeris/swephClient"
  );

  await initEphemeris();

  // Convert local time to UTC
  const localDate = new Date(
    input.year,
    input.month - 1,
    input.date,
    input.hours,
    input.minutes,
    input.seconds ?? 0
  );

  // Adjust for timezone to get UTC
  const utcMs = localDate.getTime() - input.timezone * 60 * 60 * 1000;
  const utcDate = new Date(utcMs);

  // Calculate Julian Day
  const jdUT = dateToJulianDay(utcDate);

  // Get planet positions and angles
  const [planetLongitudes, angles] = await Promise.all([
    getPlanetLongitudes(jdUT),
    getAngles(jdUT, input.latitude, input.longitude),
  ]);

  // Format planets
  const planets: AstrologyPlanet[] = [];

  // Add Ascendant first
  planets.push(formatPlanet("Ascendant", angles.asc));

  // Add main planets
  const planetOrder: Planet[] = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];

  for (const planet of planetOrder) {
    planets.push(formatPlanet(planet, planetLongitudes[planet]));
  }

  // Add angles
  planets.push(formatPlanet("Descendant", angles.dsc));
  planets.push(formatPlanet("MC", angles.mc));
  planets.push(formatPlanet("IC", angles.ic));

  // Calculate aspects between all points
  const aspects: AstrologyAspect[] = [];
  const allPoints = [
    { name: "Ascendant", lon: angles.asc },
    ...planetOrder.map((p) => ({ name: p, lon: planetLongitudes[p] })),
    { name: "Descendant", lon: angles.dsc },
    { name: "MC", lon: angles.mc },
    { name: "IC", lon: angles.ic },
  ];

  // Calculate aspects between each pair
  for (let i = 0; i < allPoints.length; i++) {
    for (let j = i + 1; j < allPoints.length; j++) {
      const aspect = findAspect(allPoints[i].lon, allPoints[j].lon);
      if (aspect) {
        aspects.push({
          planet_1: { en: allPoints[i].name },
          planet_2: { en: allPoints[j].name },
          aspect: { en: aspect.name },
        });
      }
    }
  }

  return {
    planets: {
      statusCode: 200,
      output: planets,
    },
    aspects: {
      statusCode: 200,
      output: aspects,
    },
  };
};

/**
 * Convert Date to Julian Day (UT)
 */
const dateToJulianDay = (date: Date): number => {
  const year = date.getUTCFullYear();
  let month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  const dayFraction = (hour + (minute + (second + ms / 1000) / 60) / 60) / 24;

  let Y = year;
  let M = month;

  if (M <= 2) {
    Y -= 1;
    M += 12;
  }

  const D = day + dayFraction;
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    D +
    B -
    1524.5
  );
};
