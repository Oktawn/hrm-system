import { readFileSync } from "fs";
import { google } from "googleapis";
import { resolve } from "path";

const jsonCred = JSON.parse(
  readFileSync(
    resolve(__dirname, "../token.json"), "utf8"
  )
)

export const apiGoogle = new google.auth.GoogleAuth({
  credentials: jsonCred,
  scopes: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.readonly"
  ],
})