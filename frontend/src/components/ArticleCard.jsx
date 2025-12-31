export default function ArticleCard({ article }) {
  return (
    <div className="card">
      <span className={`badge ${article.isUpdated ? "updated" : "original"}`}>
        {article.isUpdated ? "Updated Article" : "Original Article"}
      </span>

      <h2>{article.title}</h2>

      <div className="content">
        {article.content}
      </div>

      {article.references.length > 0 && (
        <div className="references">
          <strong>References</strong>
          {article.references.map((ref, i) => (
            <a key={i} href={ref} target="_blank" rel="noreferrer">
              {ref}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
