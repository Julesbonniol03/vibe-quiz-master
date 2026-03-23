import QuizClient from "./QuizClient";

interface Props {
  searchParams: { category?: string; mode?: string };
}

export default function QuizPage({ searchParams }: Props) {
  return <QuizClient initialCategory={searchParams.category} />;
}
