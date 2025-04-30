import "dotenv/config";
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate(prompt, imageBase64) {
    const contents = [];

    if (imageBase64) {
        contents.push({
          inlineData: {
            mimeType: "image/png",
            data: imageBase64,
          }
        });
      }
      
    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: contents,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No Image generated.");
}

import express from "express";
import cors from "cors";

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.post("/api/generate", async (req, res) => {
    const { prompt, imageBase64 } = req.body;
    try {
      const resultImageBase64 = await generate(prompt, imageBase64);
      res.json({ imageBase64: resultImageBase64 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });


import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));