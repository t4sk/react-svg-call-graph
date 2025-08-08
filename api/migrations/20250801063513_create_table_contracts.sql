CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    chain TEXT NOT NULL,
    address TEXT NOT NULL,
    name TEXT,
    abi JSONB,
    label TEXT
);

CREATE INDEX idx_contracts_chain_address ON contracts (chain, address);

