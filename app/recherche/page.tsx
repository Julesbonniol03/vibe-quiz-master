import { Metadata } from "next";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Recherche · Inkult",
  description: "Explorez toutes les questions et réponses du quiz Inkult",
};

export default function RecherchePage() {
  return <SearchClient />;
}
