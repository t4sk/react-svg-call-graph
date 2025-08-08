use axum::{
    Extension, Json, Router, extract::Path, http::StatusCode, routing::get,
};
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use std::env;
use tracing::{Level, info};
use tracing_subscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let host = std::env::var("HOST")?;
    let port = std::env::var("PORT")?;
    let db_url = std::env::var("DATABASE_URL")?;

    let pool = PgPoolOptions::new().connect(&db_url).await?;
    println!("Connected to database");

    tracing_subscriber::fmt().with_max_level(Level::INFO).init();

    let app = Router::new()
        .route("/", get(root))
        .route("/fn-selectors/:selector", get(get_fn_selectors))
        .layer(Extension(pool));

    let listener = tokio::net::TcpListener::bind(format!("{host}:{port}"))
        .await
        .unwrap();
    info!("Server is running on {host}:{port}");
    axum::serve(listener, app).await?;

    Ok(())
}

async fn root() -> &'static str {
    "Hello, world!"
}

#[derive(Serialize, Deserialize)]
struct PostTxTraceRequest {
    chain: String,
    tx_hash: String,
}

#[derive(Serialize, Deserialize)]
struct PostTxTraceRespons {
    // TODO:
    chain: String,
    tx_hash: String,
}

#[derive(Serialize, Deserialize)]
struct Post {
    // TODO:
    chain: String,
    tx_hash: String,
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

async fn post_tx_trace(
    Extension(pool): Extension<Pool<Postgres>>,
) -> Result<(), StatusCode> {
    Ok(())
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
