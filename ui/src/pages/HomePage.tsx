import { useState } from "react"
import { useNavigate } from "react-router-dom"

export function HomePage() {
  const navigate = useNavigate()
  const [txHash, setTxHash] = useState("")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    navigate(`/tx/${txHash}?chain=eth-mainnet`)
  }

  return (
    <form onSubmit={(e) => onSubmit(e)}>
      <input
        type="text"
        value={txHash}
        onChange={(e) => setTxHash(e.target.value)}
      />
    </form>
  )
}

export default HomePage
