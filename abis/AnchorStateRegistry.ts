export default [
  {
    inputs: [
      {
        internalType: "contract IDisputeGameFactory",
        name: "_disputeGameFactory",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "InvalidGameStatus", type: "error" },
  { inputs: [], name: "Unauthorized", type: "error" },
  { inputs: [], name: "UnregisteredGame", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [{ internalType: "GameType", name: "", type: "uint32" }],
    name: "anchors",
    outputs: [
      { internalType: "Hash", name: "root", type: "bytes32" },
      { internalType: "uint256", name: "l2BlockNumber", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "disputeGameFactory",
    outputs: [
      {
        internalType: "contract IDisputeGameFactory",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "GameType", name: "gameType", type: "uint32" },
          {
            components: [
              { internalType: "Hash", name: "root", type: "bytes32" },
              {
                internalType: "uint256",
                name: "l2BlockNumber",
                type: "uint256",
              },
            ],
            internalType: "struct OutputRoot",
            name: "outputRoot",
            type: "tuple",
          },
        ],
        internalType: "struct AnchorStateRegistry.StartingAnchorRoot[]",
        name: "_startingAnchorRoots",
        type: "tuple[]",
      },
      {
        internalType: "contract SuperchainConfig",
        name: "_superchainConfig",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IFaultDisputeGame",
        name: "_game",
        type: "address",
      },
    ],
    name: "setAnchorState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "superchainConfig",
    outputs: [
      {
        internalType: "contract SuperchainConfig",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tryUpdateAnchorState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
