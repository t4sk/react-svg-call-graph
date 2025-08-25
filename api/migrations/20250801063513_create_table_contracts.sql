CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    chain TEXT NOT NULL,
    address TEXT NOT NULL,
    name TEXT,
    abi JSONB,
    label TEXT,
    CONSTRAINT contracts_chain_address_key UNIQUE (chain, address)
);


