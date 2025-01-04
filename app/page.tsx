import TextEditor from "../components/TextEditor";
import PromptCarousel from "../components/PromptCarousel";

export default function Home() {
  return (
    <div className="flex w-full">
      <div className="w-full">
        <div className="mt-16 space-y-2">
          <h1
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              animation: 'typing 2s steps(40, end), blink-caret 0.75s step-end infinite',
            }}
            className="text-2xl max-w-fit font-thin"
          >
            Hey Mark,
          </h1>
          <h1
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              animation: 'typing 2s steps(40, end) 0.4s, blink-caret 0.75s step-end infinite',
              animationFillMode: 'both',
            }}
            className="text-2xl max-w-fit font-thin"
          >
            what would you like to do today?
          </h1>
        </div>

        <PromptCarousel />

        <div className="mt-8">
          <TextEditor />
        </div>
      </div>
    </div>
  );
}
