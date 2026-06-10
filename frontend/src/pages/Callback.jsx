import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Callback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const refresh = params.get("refresh")

    if (token) {
      localStorage.setItem("pb_token", token)
      if (refresh) localStorage.setItem("pb_refresh", refresh)
      navigate("/dashboard", { replace: true })
    } else {
      navigate("/", { replace: true })
    }
  }, [])

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "40vh" }}>
      Logging you in...
    </div>
  )
}
