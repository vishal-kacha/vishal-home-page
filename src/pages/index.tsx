import { useState } from "react";
import { Link } from "react-router";
import Greeting from "../components/Greeting";
import Quote from "../components/Quote";
import DatePicker from "../components/DatePicker";
import Notes from "../components/Notes";
import Todos from "../components/Todos";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = selectedDate.toISOString().split("T")[0];

  return (
    <div className="relative mt-12">
      <Greeting />
      <Quote />

      <div className="relative">
        <div className="flex justify-end mb-6 absolute -top-12 right-0">
          <Link
            to={`/timeline/${dateStr}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            View Timeline
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-18">
          <DatePicker
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <Notes selectedDate={selectedDate} />
          <Todos selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}
