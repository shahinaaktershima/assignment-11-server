const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app=express();
const port=process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('job server is running now');
})



const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hfsk54e.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

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

 const jobCollection=client.db('jobPlacement').collection('jobs');
 const appliedJobs=client.db('appliedJobs').collection('applied');
 const myJobs=client.db('myJobs').collection('createdJobs');
// applied
app.get('/applied',async(req,res)=>{
    const result=await appliedJobs.find().toArray();
    res.send(result);
})

app.post('/applied',async(req,res)=>{
    const applied=req.body;
    console.log(applied);
    const result=await appliedJobs.insertOne(applied);
    res.send(result)
})
// my jobs

app.post('/createdJobs',async(req,res)=>{
    const created=req.body;
    console.log(created);
    const result=await myJobs.insertOne(created);
    res.send(result)
})
app.get('/createdJobs',async(req,res)=>{
  console.log(req.query.email);
  // let query={};
  // if(req.query?.email){
  //   query={email:req.query?.email}
  // }
    const result=await myJobs.find().toArray();
    res.send(result)
})



app.delete('/createdJobs/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id: new ObjectId(id)}
    const result=await myJobs.deleteOne(query)
  res.send(result)}
    )
    app.get('/createdJobs/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const result=await myJobs.findOne(query);
        res.send(result)
     })
 app.put('/createdJobs/:id',async(req,res)=>{
    const id=req.params.id;
    const filter={_id:new ObjectId(id)}
    const option={upsert:true};
  const updatedShop=req.body;
  const jobs={
    $set:{
      name:updatedShop.name,
      description:updatedShop.description,
      category:updatedShop.category,
      title:updatedShop.title,
      deadline:updatedShop.deadline,
      image:updatedShop.image,
      salary:updatedShop.salary,
      applicants:updatedShop.applicants,
      applicants:updatedShop.applicants,
    }
  }

  const result=await myJobs.updateOne(filter,jobs,option);
  res.send(result);
 })



// jobs collection
 app.get('/jobs',async(req,res)=>{
    const cursor=jobCollection.find();
    const result=await cursor.toArray();
    res.send(result);
 })
 app.get('/jobs/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result=await jobCollection.findOne(query);
    res.send(result)
 })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log('job server is running on port',port);
})