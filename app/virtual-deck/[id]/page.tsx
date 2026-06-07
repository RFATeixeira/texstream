import { VirtualDeckTouch } from "../VirtualDeckClient";

export default async function VirtualDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VirtualDeckTouch deckId={id} />;
}
