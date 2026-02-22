import SigningInterface from "./signing-interface";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SigningInterface id={id} />;
}
