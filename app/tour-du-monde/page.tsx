import { readFileSync } from "fs";
import { join } from "path";
import TourDuMondeClient from "./TourDuMondeClient";

function loadGeoData() {
  const filePath = join(process.cwd(), "data", "tour-du-monde.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export const metadata = {
  title: "Tour du Monde — Teubé",
  description: "Trouve les pays sur la carte ! Mode géographie interactif.",
};

export default function TourDuMondePage() {
  const geoData = loadGeoData();
  return <TourDuMondeClient geoData={geoData} />;
}
