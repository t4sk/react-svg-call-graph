import { BrowserRouter, Routes, Route } from "react-router-dom"

function HomePage() {
  return <div>home</div>
}

function TxPage() {
  return <div>tx</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="tx/:hash" element={<TxPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
