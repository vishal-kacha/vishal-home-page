import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, QuerySnapshot, type DocumentData } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Quote as QuoteIcon } from "lucide-react";
import type { JSX } from "react";

type Quote = {
  text: string;
  author: string;
};

const DEFAULT_QUOTE: Quote = {
  text: "The best way to predict the future is to invent it.",
  author: "Alan Kay",
};

async function fetchRandomQuote(): Promise<Quote> {
  const quotesRef = collection(db, "quotes");
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(quotesRef);

  if (!snapshot.empty) {
    const allQuotes = snapshot.docs.map((doc) => ({
      text: doc.data().text,
      author: doc.data().author,
    }));
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    return allQuotes[randomIndex];
  }

  return DEFAULT_QUOTE;
}

function QuoteContent(): JSX.Element {
  const {
    data: quote,
    isLoading,
    isError,
  } = useQuery<Quote, Error>({
    queryKey: ["quote"],
    queryFn: fetchRandomQuote,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-xl my-6 space-y-3 mx-auto">
        <div className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
          <QuoteIcon className="w-5 h-5 mt-1 flex-shrink-0 animate-pulse" />
          <p className="md:text-lg font-medium leading-relaxed text-center">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="max-w-xl my-6 space-y-3 mx-auto">
        <div className="flex items-start gap-3 text-zinc-700 dark:text-zinc-200">
          <QuoteIcon className="w-5 h-5 mt-1 flex-shrink-0 text-zinc-950 dark:text-zinc-50 fill-zinc-950 dark:fill-zinc-50" />
          <p className="md:text-lg font-medium leading-relaxed text-center">{DEFAULT_QUOTE.text}</p>
        </div>
        <div className="flex items-center justify-end gap-3 text-zinc-600 dark:text-zinc-400">
          <p className="text-sm font-semibold">— {DEFAULT_QUOTE.author}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl my-6 space-y-3 mx-auto">
      <div className="flex items-start gap-3 text-zinc-700 dark:text-zinc-200">
        <QuoteIcon className="w-5 h-5 mt-1 flex-shrink-0 text-zinc-950 dark:text-zinc-50 fill-zinc-950 dark:fill-zinc-50" />
        <p className="md:text-lg font-medium leading-relaxed text-center">{quote.text}</p>
      </div>
      <div className="flex items-center justify-end gap-3 text-zinc-600 dark:text-zinc-400">
        <p className="text-sm font-semibold">— {quote.author}</p>
      </div>
    </div>
  );
}

export default function Quote(): JSX.Element {
  return <QuoteContent />;
}
