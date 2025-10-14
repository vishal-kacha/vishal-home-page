import { useState, useEffect } from "react";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Afternoon";
  } else {
    return "Evening";
  }
}

export default function Greeting() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <h1 className="md:text-3xl font-semibold text-center">
      Hello Good {greeting}, Vishal
    </h1>
  );
}
