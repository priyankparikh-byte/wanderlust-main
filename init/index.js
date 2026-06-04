const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);

  // initialize DB only after connection is established
  await initDB();

  // close connection when done (optional)
  await mongoose.connection.close();
}

const initDB = async () => {
  const prepared = initData.data.map((listing) => {
    const img = listing.image;

    return {
      ...listing,
      image: {
        url: typeof img === "string" ? img : (img?.url || ""),
        filename: typeof img === "string" ? "" : (img?.filename || ""),
      },
    };
  });

  await Listing.deleteMany({});
  // add owner to each prepared listing before inserting
  const preparedWithOwner = prepared.map((obj) => ({ ...obj, owner: "6a1ae1aae52a1e611972f4c0" }));
  await Listing.insertMany(preparedWithOwner);
  console.log("data was initialized");
};