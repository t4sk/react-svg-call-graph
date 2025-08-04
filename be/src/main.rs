use axum::{Router, routing::get};
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tracing::{Level, info};
use tracing_subscriber;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    let host = std::env::var("HOST")?;
    let port = std::env::var("PORT")?;
    let db_url = std::env::var("DB_URL")?;

    let pool = PgPoolOptions::new().connect(&db_url).await?;
    println!("Connected to database");

    tracing_subscriber::fmt().with_max_level(Level::INFO).init();

    let app = Router::new().route("/", get(root));

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
