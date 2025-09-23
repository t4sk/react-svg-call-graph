import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import TxPage from "./pages/TxPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="tx/:txHash" element={<TxPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
