/**
 * Supabase returns at most 1000 rows per request (PostgREST max_rows).
 * fetchAll pages through a query until everything is loaded.
 *
 *   const rows = await fetchAll((from, to) =>
 *     supabase.from("orders").select("*").order("created_at").range(from, to));
 */
export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  pageSize = 1000,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < pageSize) return out;
  }
}
