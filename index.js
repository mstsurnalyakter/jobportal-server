require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:5173",
     "https://job-portal-f2a64.web.app"
    ],
  credentials: true,
  optionSuccessStatus: 200,
};

//middleware setup
app.use(express.json());
app.use(cors(corsOptions));




const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jimwvxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    const jobCollection = client.db("jobPortal").collection("jobs");
    const applyJobCollection = client.db("jobPortal").collection("applyJobs");

    //job related api
    app.get("/jobs", async(req,res)=>{
        const result = await jobCollection.find().toArray();
        res.send(result)
    })

    app.get("/all-jobs",async(req,res)=>{
        const page = parseInt(req.query.page) - 1;
        const size = parseInt(req.query.size);
        const search = req.query.search;

        const query = {
          jobTitle: { $regex: search, $options: "i" },
        };
        const result = await jobCollection
        .find(query)
        .skip(page*size)
        .limit(size)
        .toArray();
        res.send(result);

    })


    app.get("/jobs-count", async(req,res)=>{
        const search = req.query.search;
        let query = {
          jobTitle: { $regex: search, $options: "i" },
        };
        const count = await jobCollection.countDocuments(query);
        res.send({count})

    })

    app.post("/add-jobs",async(req,res)=>{
      const result = await jobCollection.insertOne(req.body);
      res.send(result);
    })

    app.post("/apply-job",async(req,res)=>{
      console.log(req.body);
      const result = await applyJobCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/my-jobs/:email", async(req,res)=>{
      const result = await jobCollection.find({"user.email":req.params.email}).toArray();
      res.send(result);
    })
    app.delete("/my-job/:id", async (req, res) => {
      const result = await jobCollection
        .deleteOne({ _id: new ObjectId(req.params.id) })
      res.send(result);
    });

    app.get("/job/:id", async(req,res)=>{
      const result = await jobCollection.findOne({_id: new ObjectId(req.params.id)});
      res.send(result)
    })


    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get("/", (req, res) => {
  res.send("I am from Home route");
});

app.listen(port, () => {
  console.log(`Server is running at : http://localhost:${port}`);
});
