const express = require("express");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)),
  storageBucket: process.env.BUCKET
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

app.post("/upload", async (req, res) => {
  const { filename, expiryMinutes } = req.body;

  const id = uuidv4();
  const filePath = `videos/${id}-${filename}`;

  const file = bucket.file(filePath);

  const [uploadUrl] = await file.getSignedUrl({
    action: "write",
    expires: Date.now() + 10 * 60 * 1000,
    contentType: "video/mp4"
  });

  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  await db.collection("videos").doc(id).set({
    videoPath: filePath,
    expiresAt
  });

  res.json({ uploadUrl, id });
});

app.get("/view", async (req, res) => {
  const { id } = req.query;

  const doc = await db.collection("videos").doc(id).get();

  if (!doc.exists) return res.status(404).send("Not found");

  const data = doc.data();

  if (Date.now() > data.expiresAt)
    return res.status(403).send("Expired");

  const file = bucket.file(data.videoPath);

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 5 * 60 * 1000
  });

  res.json({ url });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
