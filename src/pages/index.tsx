import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useWalletClient } from "wagmi";
import {
  createClient,
  GetQuoteParameters,
  MAINNET_RELAY_API,
} from "@reservoir0x/relay-sdk";
import { useRelayChains, useRelayConfig } from "@reservoir0x/relay-kit-hooks";

const Home: NextPage = () => {
  const { data: wallet } = useWalletClient();
  const { chains } = useRelayChains(MAINNET_RELAY_API);
  const { data: config } = useRelayConfig(MAINNET_RELAY_API, {
    user: wallet?.account.address,
    originChainId: "0",
    destinationChainId: "1",
    currency: "eth",
  });

  const client = createClient({
    baseApiUrl: MAINNET_RELAY_API,
    source: "RelayKit App Fee Demo",
    chains,
  });

  const relayQ: GetQuoteParameters = {
    chainId: 0,
    currency: "eth",
    toCurrency: "0x0000000000000000000000000000000000000000",
    toChainId: 1,
    // amount: "10000000000000000",
    amount: config?.user?.maxBridgeAmount,
    wallet,
    tradeType: "EXACT_INPUT",
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <ConnectButton />
        <button
          onClick={async () => {
            try {
              const q = await client?.actions.getQuote(relayQ);
              console.log(q);

              if (wallet) {
                await client?.actions.execute({
                  quote: q,
                  wallet: {
                    ...wallet,
                    getChainId: async () =>
                      q?.details?.currencyIn?.currency?.chainId ?? 1,
                  },
                  onProgress: (steps) => {
                    console.log(steps);
                  },
                });
              }
            } catch (err) {
              alert(err);
            }
          }}
        >
          Withdrawal Fees
        </button>
      </main>
    </div>
  );
};

export default Home;
