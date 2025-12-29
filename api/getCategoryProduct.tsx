import { useEffect, useState } from "react"

export function useGetCategoryProduct(slug?: string) {
  const [result, setResult] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products` +
      `?populate=*` +
      `&filters[category][data][attributes][slug][$eq]=${slug}`

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(url)
        const json = await res.json()
        setResult(json.data ?? [])
      } catch (err) {
        setError("Error al cargar productos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  return { result, loading, error }
}
