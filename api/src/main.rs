use axum::{
    Extension, Json, Router,
    extract::Path,
    http::StatusCode,
    routing::{get, post},
};
use dotenv::dotenv;
use futures::stream::{FuturesUnordered, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use std::collections::HashSet;
use std::env;
use tracing::{Level, info};
use tracing_subscriber;

mod etherscan;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let host = std::env::var("HOST")?;
    let port = std::env::var("PORT")?;
    let db_url = std::env::var("DATABASE_URL")?;

    let pool = PgPoolOptions::new().connect(&db_url).await?;
    println!("Connected to database");

    tracing_subscriber::fmt().with_max_level(Level::INFO).init();

    // TODO: request logs
    let app = Router::new()
        .route("/contracts", post(post_contracts))
        .route("/contracts/{chain}/{address}", get(get_contract))
        .route("/fn-selectors/{selector}", get(get_fn_selectors))
        .layer(Extension(pool));

    let listener = tokio::net::TcpListener::bind(format!("{host}:{port}"))
        .await
        .unwrap();
    info!("Server is running on {host}:{port}");
    axum::serve(listener, app).await?;

    Ok(())
}

#[derive(Serialize, Deserialize)]
struct Contract {
    chain: String,
    address: String,
    name: Option<String>,
    abi: Option<Value>,
    label: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct PostContractsRequest {
    chain: String,
    chain_id: u32,
    addrs: Vec<String>,
}

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

async fn post_contracts(
    Extension(pool): Extension<Pool<Postgres>>,
    Json(req): Json<PostContractsRequest>,
) -> Result<Json<Vec<Contract>>, StatusCode> {
    // Get tx trace
    // DFS - flatten [depth, call]
    // Get contract addresses
    // Query db for contracts
    // For each contract address
    // - Get contract name and ABI
    //   - get contract from memory
    //   - if contract not in memory
    //     - query Etherscan
    //       - if ok, write to db

    let contracts = sqlx::query_as!(
        Contract,
        "SELECT chain, address, name, abi, label FROM contracts WHERE chain = $1 AND address = ANY($2)",
        req.chain, &req.addrs
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let set: HashSet<String> =
        contracts.iter().map(|c| c.address.to_string()).collect();

    let mut futs: FuturesUnordered<_> = req
        .addrs
        .iter()
        .filter(|p| !set.contains(*p))
        .map(|p| etherscan::get_contract(req.chain_id, p))
        .collect();

    while let Some(res) = futs.next().await {
        println!("RES {:#?}", res);
        // TODO: write + append to contracts
    }

    Ok(Json(contracts))
}

#[derive(Serialize, Deserialize)]
struct FnSelector {
    selector: String,
    name: String,
    inputs: Option<Value>,
    outputs: Option<Value>,
}

async fn get_fn_selectors(
    Extension(pool): Extension<Pool<Postgres>>,
    Path(selector): Path<String>,
) -> Result<Json<Vec<FnSelector>>, StatusCode> {
    // TODO: validate selector
    let selectors = sqlx::query_as!(
        FnSelector,
        "SELECT selector, name, inputs, outputs FROM fn_selectors WHERE selector = $1",
        selector
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(selectors))
}

async fn get_contract(
    Extension(pool): Extension<Pool<Postgres>>,
    Path((chain, addr)): Path<(String, String)>,
) -> Result<Json<Contract>, StatusCode> {
    // TODO: validate chain and addr
    // TODO: return Option<Contract>?
    let contract = sqlx::query_as!(
        Contract,
        "SELECT chain, address, name, abi, label FROM contracts WHERE chain = $1 AND address = $2",
        chain, addr
    )
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(Json(contract))
}
