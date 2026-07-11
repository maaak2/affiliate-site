export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-2xl font-bold">Admin login</h1>
      {error === "locked" && (
        <p className="mt-2 text-sm text-red-600">
          Too many failed attempts. Try again in a few minutes.
        </p>
      )}
      {error && error !== "locked" && (
        <p className="mt-2 text-sm text-red-600">Incorrect password.</p>
      )}
      <form method="POST" action="/api/admin/login" className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="mt-1 w-full rounded border border-black/20 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
