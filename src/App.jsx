import './App.css'
import Account from "./components/Account.jsx";
import NFT from "./components/NFT.jsx";
import {AuthProvider} from "./AuthContext.jsx";

function AuthenticatedApp() {
    return (
        <>
            <Account />
            <NFT />
        </>
    )
}
function App() {

  return (
    <>
        <AuthProvider>
            <AuthenticatedApp/>
        </AuthProvider>
    </>
  )
}

export default App
