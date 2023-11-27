const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const bookCollection = client.db("PackFlow-Parcel-Management").collection("bookItem");


    // post
    app.post('/users', async (req, res) => {
      const user = req.body
      // email chack ai email ta ase ki na
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    });

    // user see post
    // app.get('/users/:email',async(req,res) => {
    //   const email = req.params.email
    //   console.log(email)
    //   const query ={email: email}
    //   const result = await userCollection.findOne(query)
    //   res.send(result)
    // })

    // all user view
    app.get('/allUsers',async(req,res) => {
     const result = await userCollection.find().toArray()
     res.send(result)
    })

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
    
    // user book
    app.post('/parcelBook',async(req,res) =>{
      const bookItem = req.body
      const result = await bookCollection.insertOne(bookItem)
      res.send(result)
    })
    
    app.get('/parcelBook',async(req,res) => {
      const email = req.query.email
      const query ={email: email}
      const result = await bookCollection.find(query).toArray()
      res.send(result)
    })
    // all booking
    // app.get('/allParcelBook',async(req,res) => {
    //   const result = await bookCollection.find().toArray()
    //   res.send(result)
    // })
    
    app.get('/parcelBook/:id',async(req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id) }
      const result = await bookCollection.findOne(query)
      res.send(result)
    })
    // update
    app.put('/parcelBook/:id',async(req,res) => {
      const id = req.params.id
     
      const filter = {_id: new ObjectId(id) }
      const options = { upsert: true };
      const upDateProduct = req.body
      const upDateProductData = {
        $set: {
          deliveryAddressLatitude:upDateProduct.deliveryAddressLatitude,
          email:upDateProduct.email,
          name:upDateProduct.name,
          parcelDeliveryAddress:upDateProduct.parcelDeliveryAddress,
          parcelWeight:upDateProduct.parcelWeight,
          phoneNumber:upDateProduct.phoneNumber,
          price:upDateProduct.price,
          receiverPhoneNumber:upDateProduct.receiverPhoneNumber,
          receiversName:upDateProduct.receiversName,
          requestedDeliveryDate:upDateProduct.requestedDeliveryDate,
          type:upDateProduct.type,
          yourDeliveryAddressLongitude:upDateProduct.yourDeliveryAddressLongitude
        }
      }
      const result = await bookCollection.updateOne(filter, upDateProductData, options)
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