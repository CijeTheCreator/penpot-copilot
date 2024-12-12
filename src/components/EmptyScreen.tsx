import { IconSparkles } from "./Icons";

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-3xl px-4 mt-12">
      <div className="rounded-md bg-emerald-50 dark:bg-emerald-800 p-8 dark:border-none border border-foreground-muted  mb-4 w-full justify-center flex flex-col items-center">
        <span className="text-2xl flex items-center my-5">
          RepodAI
          <IconSparkles className="inline mr-0 ml-0.5 w-4 sm:w-5 mb-1 " />
        </span>
        <p className="mb-2 leading-normal text-center">
          Ask anything about the current podcast and get instant answers. Dive
          deeper into the topics, clarify details, and stay engaged with the
          conversation!
        </p>
      </div>
    </div>
  );
}
