import { createConfig } from "wagmi";
import { sapphireTestnet } from "wagmi/chains";
import {
  sapphireHttpTransport,
  injectedWithSapphire,
} from "@oasisprotocol/sapphire-wagmi-v2";

// v3 API: dùng createConfig thường + sapphireHttpTransport (xử lý mã hóa tự động)
// + injectedWithSapphire (wrap MetaMask connector cho signed transactions)
export const config = createConfig({
  chains: [sapphireTestnet],
  connectors: [
    injectedWithSapphire(),
  ],
  transports: {
    [sapphireTestnet.id]: sapphireHttpTransport(),
  },
});