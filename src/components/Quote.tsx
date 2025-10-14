import { use, cache, Suspense } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Quote as QuoteIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

const fetchRandomQuote = cache(async () => {
  const quotesRef = collection(db, "quotes");
  const snapshot = await getDocs(quotesRef);

  if (!snapshot.empty) {
    const allQuotes = snapshot.docs.map((doc) => doc.data());
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    const randomQuote = allQuotes[randomIndex];
    return {
      text: randomQuote.text,
      author: randomQuote.author,
    };
  }

  return {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
  };
});

const quotePromise = fetchRandomQuote();

function QuoteContent() {
  const quote = use(quotePromise);

  return (
    <div className="max-w-xl my-6 space-y-3 mx-auto">
      <div className="flex items-start gap-3 text-zinc-700 dark:text-zinc-200">
        <QuoteIcon className="w-5 h-5 mt-1 flex-shrink-0 text-zinc-950 dark:text-zinc-50 fill-zinc-950 dark:fill-zinc-50" />
        <p className="md:text-lg font-medium leading-relaxed text-center">
          {quote.text}
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 text-zinc-600 dark:text-zinc-400">
        <p className="text-sm font-semibold">— {quote.author}</p>
      </div>
    </div>
  );
}

function QuoteLoadingFallback() {
  return (
    <div className="my-4 text-zinc-600 dark:text-zinc-400 flex justify-center">
      <div className="flex items-center gap-2">
        <QuoteIcon className="w-5 h-5 animate-pulse" />
        <span>Loading quote...</span>
      </div>
    </div>
  );
}

export default function Quote() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<QuoteLoadingFallback />}>
        <QuoteContent />
      </Suspense>
    </ErrorBoundary>
  );
}
