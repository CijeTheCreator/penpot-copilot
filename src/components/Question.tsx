export function Question({ question }: { question: string }) {
  return (
    <h2 className="text-2xl font-semibold  tracking-tight leading-tight border-b-2 border-gray-300 dark:border-gray-500  pb-2">
      {question}
    </h2>
  );
}
