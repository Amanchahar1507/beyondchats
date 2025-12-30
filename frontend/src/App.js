import { useEffect, useState } from "react"
import axios from "axios"

export default function App() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    axios.get("http://localhost:5000/api/articles")
      .then(res => setArticles(res.data))
  }, [])

  return (
    <div style={{ padding: 40 }}>
      {articles.map(a => (
        <div key={a._id} style={{ marginBottom: 40 }}>
          <h2>{a.title}</h2>
          <p>{a.content}</p>
          {a.references.map(r => <a href={r}>{r}</a>)}
        </div>
      ))}
    </div>
  )
}
