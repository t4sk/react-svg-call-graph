const addrs = [
  "0xd24cba75f7af6081bff9e6122f4054f32140f49e",
  "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
  "0xef434e4573b90b6ecd4a00f4888381e4d0cc5ccd",
  "0x2f39d218133afab8f2b819b1066c7e434ad94e9e",
  "0x4c52fe2162200bf26c314d7bbd8611699139d553",
  "0xcf8d0c70c850859266f5c338b38f9d663181c314",
  "0xac725cb59d16c81061bdea61041a8a5e73da9ec6",
  "0x018008bfb33d285247a21d44e50697654f754e63",
  "0x7effd7b47bfd17e52fb7559d3f924201b9dbff3d",
  "0x54586be62e3c3580375ae3723c145253060ca0c2",
  "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
  "0x7d4e742018fb52e48b08be73d041c18b21de6fb5",
  "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8",
  "0x5ae8365d0a30d67145f0c55a08760c250559db64",
  "0xae78736cd615f374d3085123a210448e74fc6393",
  "0x1d8f8f00cfa6758d7be78336684788fb0ee0fa46",
  "0x6cc65bf618f55ce2433f9d8d827fc44117d81399",
  "0xcc9ee9483f662091a1de4795249e24ac0ac2630f",
  "0xaeb897e1dc6bbdced3b9d551c71a8cf172f27ac4",
  "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9",
  "0x709783ab12b65fd6cd948214eee6448f3bdd72a3",
  "0x8164cc65827dcfe994ab23944cbc90e0aa80bfcb",
  "0xe7b67f44ea304dd7f6d215b13686637ff64cd2b2",
  "0x9ec6f08190dea04a54f8afc53db96134e5e3fdfb",
  "0x6b175474e89094c44da98b954eedeac495271d0f",
]

const contracts = [
  {
    addr: "0xd24cba75f7af6081bff9e6122f4054f32140f49e",
    name: "",
  },
  {
    addr: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2",
    name: "InitializableImmutableAdminUpgradeabilityProxy",
  },
  {
    addr: "0xef434e4573b90b6ecd4a00f4888381e4d0cc5ccd",
    name: "PoolInstance",
  },
  {
    addr: "0x2f39d218133afab8f2b819b1066c7e434ad94e9e",
    name: "PoolAddressesProvider",
  },
  {
    addr: "0x4c52fe2162200bf26c314d7bbd8611699139d553",
    name: "BorrowLogic",
  },
  {
    addr: "0xcf8d0c70c850859266f5c338b38f9d663181c314",
    name: "InitializableImmutableAdminUpgradeabilityProxy",
  },
  {
    addr: "0xac725cb59d16c81061bdea61041a8a5e73da9ec6",
    name: "VariableDebtToken",
  },
  {
    addr: "0x018008bfb33d285247a21d44e50697654f754e63",
    name: "InitializableImmutableAdminUpgradeabilityProxy",
  },
  {
    addr: "0x7effd7b47bfd17e52fb7559d3f924201b9dbff3d",
    name: "AToken",
  },
  {
    addr: "0x54586be62e3c3580375ae3723c145253060ca0c2",
    name: "AaveOracle",
  },
  {
    addr: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
    name: "EACAggregatorProxy",
  },
  {
    addr: "0x7d4e742018fb52e48b08be73d041c18b21de6fb5",
    name: "AccessControlledOCR2Aggregator",
  },
  {
    addr: "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8",
    name: "InitializableImmutableAdminUpgradeabilityProxy",
  },
  {
    addr: "0x5ae8365d0a30d67145f0c55a08760c250559db64",
    name: "RETHPriceCapAdapter",
  },
  {
    addr: "0xae78736cd615f374d3085123a210448e74fc6393",
    name: "RocketTokenRETH",
  },
  {
    addr: "0x1d8f8f00cfa6758d7be78336684788fb0ee0fa46",
    name: "RocketStorage",
  },
  {
    addr: "0x6cc65bf618f55ce2433f9d8d827fc44117d81399",
    name: "RocketNetworkBalances",
  },
  {
    addr: "0xcc9ee9483f662091a1de4795249e24ac0ac2630f",
    name: "InitializableImmutableAdminUpgradeabilityProxy",
  },
  {
    addr: "0xaeb897e1dc6bbdced3b9d551c71a8cf172f27ac4",
    name: "PriceCapAdapterStable",
  },
  {
    addr: "0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9",
    name: "EACAggregatorProxy",
  },
  {
    addr: "0x709783ab12b65fd6cd948214eee6448f3bdd72a3",
    name: "AccessControlledOCR2Aggregator",
  },
  {
    addr: "0x8164cc65827dcfe994ab23944cbc90e0aa80bfcb",
    name: "InitializableImmutableAdminUpgradeabilityProxy",
  },
  {
    addr: "0xe7b67f44ea304dd7f6d215b13686637ff64cd2b2",
    name: "RewardsController",
  },
  {
    addr: "0x9ec6f08190dea04a54f8afc53db96134e5e3fdfb",
    name: "DefaultReserveInterestRateStrategyV2",
  },
  {
    addr: "0x6b175474e89094c44da98b954eedeac495271d0f",
    name: "Dai",
  },
]

