import "./styles/main.css"
import ArticleList from "./components/ArticleList"

export default function App() {
  return (
    <div className="container">
      <div className="header">
        <h1>BeyondChats Blog Articles</h1>
        <p>Original articles and AI-updated versions based on top-ranking content</p>
      </div>

      <ArticleList />
    </div>
  )
}
