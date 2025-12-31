import { useEffect, useState } from "react"
import axios from "axios"
import ArticleCard from "./ArticleCard"

export default function ArticleList() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    axios.get("http://localhost:5000/api/articles")
      .then(res => setArticles(res.data))
  }, [])

  return (
    <div className="grid">
      {articles.map(article => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </div>
  )
}
