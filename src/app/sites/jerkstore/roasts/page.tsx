import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GUEST_COOKIE, readGuestCookie } from "../_lib/guest-identity";
import { Logo } from "../_components/logo";
import styles from "./roasts.module.css";

export const metadata: Metadata = {
  title: "Your roast history | Jerkstore",
  description: "Your own Jerkstore roasts, kept together in one place.",
  robots: { index: false, follow: false },
};

export default async function RoastHistory({ searchParams }: { searchParams: Promise<{ before?: string }> }) {
  const { before } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  let userId = session?.user.id;
  if (!userId) {
    const guestId = readGuestCookie((await cookies()).get(GUEST_COOKIE)?.value);
    if (guestId) {
      const guest = await prisma.user.findUnique({ where: { id: guestId }, select: { id: true, isGuest: true } });
      if (guest?.isGuest) userId = guest.id;
    }
  }
  if (before) {
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(before)) notFound();
    const ownCursor = await prisma.jerkstore_insult.findFirst({ where: { id: before, userId }, select: { id: true } });
    if (!ownCursor) notFound();
  }
  const roasts = userId ? await prisma.jerkstore_insult.findMany({
    where: { userId }, take: 21, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(before ? { cursor: { id: before }, skip: 1 } : {}),
    select: { id: true, content: true, topic: true, heatLevel: true, createdAt: true },
  }) : [];
  const visible = roasts.slice(0, 20);
  return <div className={styles.page}>
    <header className={styles.header}><Link href="/" aria-label="Jerkstore home"><Logo /></Link><Link href="/#generator">Make another roast</Link></header>
    <main className={styles.main}>
      <p className={styles.kicker}>The receipts</p><h1>All your roasts.</h1>
      <p>This is your own history, not a public wall. Guest history belongs to this browser; signing in uses your account history.</p>
      {visible.length === 0 ? <section className={styles.empty}><h2>No roasts here yet.</h2><p>Generate a free roast to start your collection. Use this browser for guest roasts or sign in to see your account history.</p><Link href="/#generator" className={styles.button}>Try the free generator</Link></section> : <div className={styles.grid}>
        {visible.map(roast => <article className={styles.roast} key={roast.id}>
          <p className={styles.kicker}>{roast.heatLevel} · <time dateTime={roast.createdAt.toISOString()}>{roast.createdAt.toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}</time></p>
          <h2>{roast.topic || "Untitled roast"}</h2><blockquote>{roast.content}</blockquote>
        </article>)}
      </div>}
      {roasts.length > 20 && <Link href={`/roasts?before=${visible[visible.length - 1].id}`} className={styles.button}>Older roasts</Link>}
      {before && <Link href="/roasts" className={styles.back}>Back to the latest</Link>}
    </main>
  </div>;
}
