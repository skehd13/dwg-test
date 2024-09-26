import { PrismaClient } from "@prisma/client";
import { getLayer, parseDWG } from "dwg-parserjs";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { Readable } from "stream";

type CRUD = "GET" | "POST" | "PUT" | "DELETE";

type API_ROUTE = {
  method: CRUD;
  path: string;
  handler: import("express").RequestHandler;
  middleware?:
    | import("express").RequestHandler
    | import("express").RequestHandler[];
};

const apiRouter: API_ROUTE[] = [];
const prisma = new PrismaClient();

function createJsonStream(data: any) {
  const readable = new Readable({
    read() {
      this.push(JSON.stringify(data)); // JSON 문자열로 변환하여 푸시
      this.push(null); // 스트림 종료
    },
  });
  return readable;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../../public/uploads"));
    },
    filename: function (req, file, cb) {
      const name = file.originalname;
      cb(null, name);
    },
  }),
});

const parseDWGFn = (req: Request, res: Response) => {
  // const filePath = path.join(__dirname, "../../public/x-1f.dwg");
  console.log(req.body);
  const { filePath, selectedLayerNames } = req.body;
  if (filePath) {
    console.log(filePath);
    console.log("start", selectedLayerNames, new Date());
    const dwg = parseDWG(filePath, selectedLayerNames);
    console.log("end", new Date());
    res.setHeader("Content-Type", "application/json"); // Content-Type 설정
    const jsonStream = createJsonStream(dwg);

    // 스트림을 응답으로 파이프
    jsonStream.pipe(res);
    // return res.send({ dwg });
  } else {
    return res.send({ message: "파일이 없습니다." });
  }
};

const getLayerFn = (req: Request, res: Response) => {
  if (req.file) {
    console.log(req.file);
    const filePath = req.file.path;
    console.log(filePath);
    console.log("start", new Date());
    const dwg = getLayer(filePath);
    console.log("end", new Date());
    res.setHeader("Content-Type", "application/json"); // Content-Type 설정

    // 스트림을 응답으로 파이프
    res.send({ filePath, dwg });
    // return res.send({ dwg });
  } else {
    return res.send({ message: "파일이 없습니다." });
  }
};

apiRouter.push({
  method: "POST",
  path: "/parse",
  handler: parseDWGFn,
});
apiRouter.push({
  method: "POST",
  path: "/layer",
  middleware: upload.single("file"),
  handler: getLayerFn,
});

export default apiRouter;
