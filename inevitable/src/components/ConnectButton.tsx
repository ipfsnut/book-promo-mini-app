import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Find the injected connector (MetaMask)
  const injectedConnector = connectors.find(c => c.id === 'injected');

  if (isConnected) {
    return (
      <div className="connect-info">
        <div className="address">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button className="disconnect-button" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      className="connect-button" 
      onClick={() => {
        // Use the injected connector if available, otherwise use the first connector
        if (injectedConnector) {
          connect({ connector: injectedConnector });
        } else {
          connect({ connector: connectors[0] });
        }
      }}
      disabled={isPending}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
