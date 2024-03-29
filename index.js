const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.87bzbwh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    const productCollection = client.db("orderDb").collection("product");
    const orderCollection = client.db('orderDb').collection('orders');
    const adminCollection = client.db('orderDb').collection("admin");

    app.get('/product', async(req, res) =>{
        const result = await productCollection.find().toArray();
        res.send(result)
    })

  // totalPrice
app.post('/orders', async (req, res) => {
  try {
      let orders = req.body;

      // Ensure orders is an array, even if only one order is sent
      if (!Array.isArray(orders)) {
          orders = [orders];
      }

      const totalPriceArray = [];

      // Calculate total price for each order and add totalPrice field to each order
      const ordersWithTotalPrice = orders.map(order => {
          const totalPrice = order.quantity * order.price;
          totalPriceArray.push(totalPrice);
          return {
              ...order,
              totalPrice
          };
      });

      // Insert all orders with totalPrice into the database
      const result = await orderCollection.insertMany(ordersWithTotalPrice);

      // Calculate total totalPrice
      const totalPrice = totalPriceArray.reduce((acc, curr) => acc + curr, 0);

      res.json({ message: 'Orders stored successfully', result, totalPrice });
  } catch (error) {
      console.error('Error storing orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
  



        app.get('/orders', async(req, res) =>{
        const result = await orderCollection.find().toArray();
        res.send(result)
    })

       // Get orders of customer
       app.get('/orders/:email', async (req, res) =>{
        const email = req.params.email
        const query = { 'userEmail': email}
        const result = await orderCollection.find(query).toArray()
        console.log(result)
        res.send(result)
      })

      //Get customer order by Admin
      app.post('/admin', async (req, res) => {
  try {
    const order = req.body;
    console.log(order);
    const result = await adminCollection.insertOne(order);
    res.json({ message: 'Order stored successfully', result });
  } catch (error) {
    console.error('Error storing order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

       app.get('/admin', async(req, res) =>{
        const result = await adminCollection.find().toArray();
        res.send(result)
    })

// DELETE request to /order route
app.delete('/orders/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const query = { "userEmail": email };
    const result = await orderCollection.deleteMany(query);
    console.log(result);

    if (result.deletedCount === 0) {
      console.log(`No documents matched the query for email: ${email}`);
      res.status(404).send('No documents matched the query');
      return;
    }

    res.status(200).send(`Deleted ${result.deletedCount} documents successfully`);
  } catch (error) {
    console.error('Error deleting orders:', error);
    res.status(500).send('Internal Server Error');
  }
});



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('order-me is running')
})

app.listen(port, () =>{
    console.log(`Order me is waiting for your order on port ${port}`);
})





// app.post('/orders', async (req, res) => {
//   try {
//     const order = req.body;
//     console.log(order);
//     const result = await orderCollection.insertOne(order);
//     res.json({ message: 'Order stored successfully', result });
//   } catch (error) {
//     console.error('Error storing order:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });





