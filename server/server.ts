import express from "express";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { connectRoute } from "./routes";
import cors from "cors";
import bodyParser from "body-parser";
// import { createSocket } from "./utils/socket";

const app = express();
const port = 3000;

// createSocket();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));
app.use("/public", express.static(path.join(__dirname, "../public")));
const prisma = new PrismaClient();
app.get("/migration", async (req, res) => {
  const jsonFile = fs.readFileSync(path.join(__dirname, "/list.json"), "utf8");
  const jsonData = JSON.parse(jsonFile);
  await Promise.all(
    jsonData.list.map(async (list: any) => {
      const data = {
        id: "",
        name: "",
        enName: "",
        CASNo: "",
        oldName: "",
        ...list,
      };
      await prisma.list.create({
        data,
      });
    })
  );
  res.send(true);
});

connectRoute(app);

app.listen(port, () => {
  console.log("start server");
});
