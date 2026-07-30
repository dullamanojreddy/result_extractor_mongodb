import { MongoClient } from "mongodb";

const uri =
"mongodb://dulla_manoj_reddy:Test1234567890@ac-7jv3rj5-shard-00-00.4ch1ml7.mongodb.net:27017,ac-7jv3rj5-shard-00-01.4ch1ml7.mongodb.net:27017,ac-7jv3rj5-shard-00-02.4ch1ml7.mongodb.net:27017/result_db?ssl=true&authSource=admin&retryWrites=true&w=majority";

try {
  const client = new MongoClient(uri);
  await client.connect();
  console.log("✅ Connected");
  console.log(await client.db("admin").command({ ping: 1 }));
  await client.close();
} catch (err) {
  console.error(err);
}