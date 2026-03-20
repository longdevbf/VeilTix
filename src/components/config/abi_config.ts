
import { createConfig } from 'wagmi';
import { sapphire } from 'wagmi/chains';
import { sapphireHttpTransport } from '@oasisprotocol/sapphire-wagmi-v2';

export const config = createConfig({
  chains: [sapphire],
  transports: {
    [sapphire.id]: sapphireHttpTransport(),
  },
});
