import { createConfig } from "wagmi";
import { sapphire, mainnet, sapphireTestnet } from "wagmi/chains";
import { metaMask } from "@wagmi/connectors";
import {
  wrapConnectorWithSapphire,
  sapphireHttpTransport,
  sapphireLocalnet
} from "@oasisprotocol/sapphire-wagmi-v2";
import { http } from "wagmi";

export const config = createConfig({
  chains: [sapphire, sapphireTestnet, mainnet],
  // connectors: [
  //   // Sapphire-wrapped aware MetaMask for Sapphire chains, unwrapped for other chains
  //    wrapConnectorWithSapphire(
  //     metaMask(),
  //     {
  //       id: 'metamask-sapphire',
  //       name: 'MetaMask (Sapphire)',
  //     }
  //   ),
  // ],
  transports: {
    [sapphire.id]: sapphireHttpTransport(),
    [sapphireTestnet.id]: sapphireHttpTransport(),
    [mainnet.id]: http(),
  },
});