import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Promijenite 'post' u 'POST' kako biste koristili velika slova za imenovanje metode
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.uploadDir = "./uploads";
    form.keepExtensions = true;
    await new Promise((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(500).json({ message: 'Error processing file.' });
          reject(err);
          return;
        }

        // Logika za obradu POST zahtjeva...
        const filePath = files.attachment.filepath;
        const file = await openai.files.create({
          file: fs.createReadStream(filePath),
          purpose: 'assistants',
        });

        // Nastavak obrade...

        res.status(200).json({ message: 'File successfully uploaded.', file });
        resolve(file);
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
