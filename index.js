const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000



const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@practiceproject.lzr2b0r.mongodb.net/?retryWrites=true&w=majority`;

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
        // client.connect();

        
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


//its e indexing search
const usersCollections = client.db('blueRay').collection('users')
const productsCollection = client.db('blueRay').collection('products')
const ordersCollection = client.db('blueRay').collection('orders')



// const indexKey = { title: 1, category: 1 }
// const indexOptions = { name: "titleSearch" }
// const searchResult = await productsCollection.createIndex(indexKey, indexOptions);


app.get('/searchPoduct/:name', async (req, res) => {
    const name = req.params.name
    const result = await productsCollection.find({
        $or: [
            { name: { $regex: name, $options: "i" } },
            { sub_category: { $regex: name, $options: "i" } }
        ]
    }).toArray()
    res.send(result);
})

//newArrivals

app.get('/products', async (req, res) => {

    const result = await productsCollection.find().toArray()
    res.send(result);
})
app.get('/orders', async (req, res) => {
    const result = await ordersCollection.find().toArray()
    res.send(result);
})
app.get('/myOrders/:email', async (req, res) => {

    const email = req.params.email
    let query = { userEmail: email }
    const result = await ordersCollection.find(query).toArray()
    res.send(result);
})

app.get('/isAdmin/:email', async (req, res) => {

    const email = req.params.email
    let query = { email: email }
    const user = await usersCollections.findOne(query)
    console.log(user);
    const result = { admin: user?.role == 'admin' }
    console.log(result);
    res.send(result);


})

app.get('/allOrders', async (req, res) => {

    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    console.log(page, limit);
    const skip = (page * limit)

    if (req.query?.regularType) {
        const query = { expressPrice: '' }
        const result = await ordersCollection.find(query).toArray()
        return res.send(result);
    }
    if (req.query?.expressType) {

        const result = await ordersCollection.find().toArray()
        const express = result.filter(pd => pd.expressPrice !== '')
        return res.send(express);
    }

    const result = await ordersCollection.find().skip(skip).limit(limit).toArray()
    res.send(result);
})


///count
app.get('/allOrders/countDocuments', async (req, res) => {
    const count = await ordersCollection.countDocuments()
    res.send({ count });
})



app.get('/products/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await productsCollection.findOne(query)
    res.send(result);
})


// POST /products
app.post('/products', async (req, res) => {
    // Retrieve the data from the request body
    const orderProduct = req.body;
    const result = await ordersCollection.insertOne(orderProduct)
    res.send(result);
});

app.get('/', (req, res) => {
    res.send(`The server is running.The port is: ${port}`);
})
app.listen(port, () => {
    console.log(`The server is running.The port is: ${port}`);
})