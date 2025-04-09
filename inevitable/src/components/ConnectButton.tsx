import { useAccount, useConnect, useDisconnect } from "wagmi";
import { authService } from "../services/authService";
import { useWalletAuth } from "../hooks/useWalletAuth";

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, signIn } = useWalletAuth();

  const handleDisconnect = async () => {
    // Sign out from our authentication system
    if (isAuthenticated) {
      await authService.signOut();
    }
    // Disconnect the wallet
    disconnect();
  };

  const handleSignIn = async () => {
    if (isConnected && !isAuthenticated) {
      await signIn();
    }
  };

  if (isConnected) {
    return (
      <div className="connect-info">
        <div className="address">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        {isAuthenticated ? (
          <span className="auth-status">✓ Signed</span>
        ) : (
          <button className="sign-button" onClick={handleSignIn}>
            Sign
          </button>
        )}
        <button className="disconnect-button" onClick={handleDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      className="connect-button" 
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
