const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require("cors");
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// PackFlow-Parcel-Management
// KVQsmjSqhClwqrJk


const uri = `mongodb+srv://${process.env.SECRET_USER_NAME}:${process.env.SECRET_PASS}@cluster0.z9hqskk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    const userCollection = client.db("PackFlow-Parcel-Management").collection("users");
    const deliveryManCollection = client.db("PackFlow-Parcel-Management").collection("deliveryMan");


    // post
    app.post('/users', async (req, res) => {
      const user = req.body
      // email chack ai email ta ase ki na
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }

      // user see post
      const result = await userCollection.insertOne(user)
      res.send(result)
    });
    // todo non secure
    app.get('/top-deliveryman', async (req, res) => {
      const topDeliverymanSort = [
        {
          $addFields: {
            average_ratings: { $avg: "$ratings" }
          }
        },
        {$sort: {
            parcels_delivered: -1,
            average_ratings: -1
          }
        },
        {$limit: 5},
        {
          $project: {
            _id: 0,
            name: 1,
            image: 1,
            parcels_delivered: 1,
            average_ratings: 1
          }
        }
      ];

      try {
        const result = await deliveryManCollection.aggregate(topDeliverymanSort).toArray();
        const topResult = result.slice(0, 5);
        res.send(topResult);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching top delivery men");
      }
    });

   
    // todo secure
    app.get('/deliveryman', async (req, res) => {
      const result = await deliveryManCollection.find().toArray()
      res.send(result)
    })















    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.get("/", (req, res) => {
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});