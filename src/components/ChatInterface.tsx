export function ChatInterface({
  reply,
  replyLoading,
  replyLoadingText,
  replyError: replyError,
  handleSubmit,
}: {
  reply: string | null;
  replyLoading: boolean;
  replyLoadingText: string | null;
  replyError: string | null;
  handleSubmit: () => void;
}) {
  return <div>ChatInterface</div>;
}
