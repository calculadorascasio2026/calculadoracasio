type Props = {
  data: Record<string, unknown> | Record<string, unknown>[]
}

export function JsonLd({ data }: Props) {
  const payload = Array.isArray(data) ? data : [data]
  return (
    <>
      {payload.map((item, i) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          key={i}
          type="application/ld+json"
        />
      ))}
    </>
  )
}
