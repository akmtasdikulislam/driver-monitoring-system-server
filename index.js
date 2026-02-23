const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary");
const fs = require("fs");
var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require("dotenv").config();
const auth = admin.auth();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dkmkvf0.mongodb.net/?retryWrites=true&w=majority`;
app.use(cors());
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
// app.use(bodyParser.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

cloudinary.config({
  cloud_name: "disqpzshx",
  api_key: "284215161571819",
  api_secret: "5PUcZejTwrXZc6kyGWYkzWcAShc",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"), // cb -> callback
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("profilePhoto");

app.get("/sleep-count/:email", (req, res) => {
  const { email } = req.params;
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      const database = client.db(process.env.DB_NAME);
      const sleepCount = database.collection(process.env.DB_COLLECTION);
      console.log(email);
      const cursor = sleepCount.find({ email: email });
      const allValues = await cursor.toArray();
      res.send(allValues);
    } catch (error) {
      res.send(error);
      console.log(error);
    }
  }
  run().catch(console.dir);
});

app.post("/sleep-count/add", (req, res) => {
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      const database = client.db(process.env.DB_NAME);
      const sleepCount = database.collection(process.env.DB_COLLECTION);

      const result = await sleepCount.insertOne(req.body);
      if (result.insertedId) {
        res.send(
          `Sleep record added to database successfully, Sleep Record ID:${result.insertedId}`
        );
      }
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);
});

app.post("/add-new-driver", async (req, res) => {
  const database = await client.db(process.env.DB_NAME);
  const driverList = await database.collection("driverList");
  const result = await driverList.insertOne(req.body);
  await console.log(result);
  await res.send(result);
});

app.get("/driver-list", async (req, res) => {
  const database = await client.db(process.env.DB_NAME);
  const driverList = await database.collection("driverList");
  const allDriverCursor = await driverList.find({});
  const allDriver = await allDriverCursor.toArray();

  res.send(allDriver);
});

app.get("/driver-list/:id", async (req, res) => {
  try {
    const objectID = new ObjectId(req.params.id);
    const database = await client.db(process.env.DB_NAME);
    const driverList = await database.collection("driverList");
    const driver = await driverList.findOne({ _id: objectID });

    res.send(driver);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/sign-in/:email", (req, res) => {
  const email = req.params.email;
  try {
    auth
      .getUserByEmail(email)
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log(
          `Successfully fetched user data: ${JSON.stringify(
            userRecord.toJSON()
          )}`
        );
        res.json(true);
      })
      .catch((error) => {
        console.log("Error fetching user data:", error);
        res.send(false);
      });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});
app.post("/create-new-account", (req, res) => {
  console.log("uploading");
  handleMultipartData(req, res, async (err) => {
    if (err) {
      res.json({ msgs: err.message });
    }

    const filePath = req.file.path;

    if (!filePath) {
      return;
    }

    cloudinary.v2.uploader.upload(filePath, (error, result) => {
      if (error) {
        res.send(error.message);
      } else {
        const { fullName, email, password } = req.body;
        const photoURL = result.secure_url;
        auth
          .createUser({
            email: email,
            emailVerified: false,
            password: password,
            displayName: fullName,
            photoURL: photoURL,
            disabled: false,
          })
          .then((userRecord) => {
            // See the UserRecord reference doc for the contents of userRecord.
            console.log("Successfully created new user:", userRecord.uid);
            res.send({
              file: result,
              userRecord,
            });
          })
          .catch((error) => {
            console.log("Error creating new user:", error);
            res.send(error);
            cloudinary.v2.uploader
              .destroy(result.public_id)
              .then((results) => console.log("asset deleted", results));
          });

        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(`${result.original_filename} deleted`);
          //file removed
        });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Driver Monitoring Sever is listening on port ${port}`);
});
