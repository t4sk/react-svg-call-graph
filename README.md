# react-svg-digraph

### Memo

https://app.blocksec.com/explorer/tx/eth/0x69b09bf5d3bf96cc8bb4871d5423512738dc112684aecb33ea40cc15c71ea3f6

https://www.quicknode.com/docs/ethereum/debug_traceTransaction

https://github.com/openchainxyz/openchain-monorepo/tree/main

```
// TODO: db
// # contracts
// chain => address => contract
//                     - chain (index)
//                     - address (index)
//                     - name
//                     - abi
//                     - label
// # function selectors
// - selector (index)
// - inputs
// - outputs
// # trace
// - tx hash
// - calls
```

https://www.rustfinity.com/blog/create-high-performance-rest-api-with-rust#what-is-sqlx

https://github.com/koskeller/axum-postgres-template

```shell
docker run --name rust-postgres-db \
    -e POSTGRES_PASSWORD=password \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_DB=dev \
    -p 5432:5432 \
    -d postgres

    -v pgdata:/var/lib/postgresql/data \

cargo install sqlx-cli --no-default-features --features native-tls,postgres

DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
echo "DATABASE_URL=postgres://postgres:password@localhost:5432/dev" >> .env

sqlx database create
sqlx migrate add create_table_contracts

sqlx migrate run

cargo add tokio -F full
```
