const greeter = process.env.GREETER;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  while(true) {
    console.log(`Microservices rock! Greetings from ${greeter}`);
    await sleep(5000);
  }
}

main();
