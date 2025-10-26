import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="text-center mt-16">
        <h1 className="text-4xl font-bold">Puli</h1>
        <p className="mt-3 text-gray-600">
          Your ChatGPT-like assistant. Sign up or start chatting.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/signup" className="rounded bg-black px-5 py-2 text-white">
            Sign up
          </Link>
          <Link href="/signin" className="rounded border px-5 py-2">
            Sign in
          </Link>
          <Link href="/chat" className="rounded border px-5 py-2">
            Open Chat
          </Link>
        </div>
      </div>
    </main>
  );
}
