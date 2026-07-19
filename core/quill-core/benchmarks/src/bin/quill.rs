use datafusion::error::Result;
use structopt::StructOpt;
use quill_benchmarks::quill;

#[derive(Debug, StructOpt)]
#[structopt(name = "QUILL", about = "QUILL Benchmarks.")]
enum QuillOpt {
    Benchmark(quill::run::RunOpt),
}

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::init();
    match QuillOpt::from_args() {
        QuillOpt::Benchmark(opt) => opt.run().await,
    }
}
