const networks = [
  {
    chainId: 0x01,
    title: 'Ethereum',
    aliases: [ 'mainnet' ],
    explorerUrl: 'https://etherscan.io/search?q=',
    icon: '/networks/ethereum.png',
    outdatedThresholdSeconds: 600,
    isEnabled: true
  },

  {
    chainId: 0x89,
    title: 'Polygon',
    aliases: [ 'matic' ],
    explorerUrl: 'https://polygonscan.com/search?q=',
    icon: '/networks/polygon.png',
    outdatedThresholdSeconds: 600,
    isEnabled: true
  },

  {
    chainId: 0x38,
    title: 'BNB Chain',
    aliases: [ 'bsc', 'bnb' ],
    explorerUrl: 'https://bscscan.com/search?q=',
    icon: '/networks/bnb.png',
    outdatedThresholdSeconds: 600,
    isEnabled: true
  },

  {
    chainId: 0xfa,
    title: 'Fantom Opera',
    aliases: [ 'ftm', 'fantom' ],
    explorerUrl: 'https://ftmscan.com/search?q=',
    icon: '/networks/fantom-opera.png',
    outdatedThresholdSeconds: 600,
    isEnabled: false
  }
];

const networkByChainId = {};
const chainIdByTitle = {};
const networksListForSelect = [];

for (const network of networks) {
  networkByChainId[network.chainId] = network;

  chainIdByTitle[network.title.toLowerCase()] = network.chainId;

  if (network.aliases) {
    network.aliases.forEach(alias => chainIdByTitle[alias.toLowerCase()] = network.chainId);
  }

  if (network.isEnabled) {
    networksListForSelect.push({
      label: network.title,
      value: network.chainId,
      icon: network.icon
    });

  } else {
    networksListForSelect.push({
      label: network.title + ' (coming soon!)',
      value: network.chainId,
      icon: network.icon,
      attrs: { disabled: true }
    });
  }
}

export {
  networks,
  networkByChainId,
  chainIdByTitle,
  networksListForSelect
};
