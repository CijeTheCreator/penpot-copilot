import { IconSparkles } from "./Icons";

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-3xl px-4 mt-12">
      <div className="rounded-md p-8 dark:border-none border border-foreground-muted  mb-4 w-full justify-center flex flex-col items-center">
        <span className="text-2xl flex items-center my-5">
          Penpot Copilot
          <IconSparkles className="inline mr-0 ml-0.5 w-4 sm:w-5 mb-1 " />
        </span>
        <p className="mb-2 leading-normal text-center">
          Ask anything about your Penpot designs and get instant answers. Create
          components, explore your files, and bring your ideas to life. If you
          can think it, you can build it!
        </p>
      </div>
    </div>
  );
}
