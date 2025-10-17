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
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const renderQuote = (text: string, author: string) => (
    <div className="w-full max-w-md md:max-w-xl px-4 sm:px-6 py-4 mx-auto text-center">
      <div className="flex flex-col items-center justify-center text-zinc-700 dark:text-zinc-200">
        <QuoteIcon className="w-5 h-5 sm:w-6 sm:h-6 mb-2 text-zinc-900 dark:text-zinc-50 fill-zinc-900 dark:fill-zinc-50" />
        <p className="text-base sm:text-lg md:text-xl font-medium leading-relaxed text-zinc-700 dark:text-zinc-200">
          {text}
        </p>
      </div>
      <div className="mt-3 text-sm sm:text-base font-semibold text-zinc-500 dark:text-zinc-400 text-right">
        — {author}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-md md:max-w-xl px-4 sm:px-6 py-4 mx-auto animate-pulse">
        <div className="flex flex-col items-center space-y-2 text-zinc-600 dark:text-zinc-400">
          <QuoteIcon className="w-5 h-5 sm:w-6 sm:h-6 mt-1" />
          <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded-md" />
          <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError || !quote) {
    return renderQuote(DEFAULT_QUOTE.text, DEFAULT_QUOTE.author);
  }

  return renderQuote(quote.text, quote.author);
}

export default function Quote(): JSX.Element {
  return <QuoteContent />;
}
