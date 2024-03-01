import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';


const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Promijenite 'post' u 'POST' kako biste koristili velika slova za imenovanje metode
export async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  
  const form = new IncomingForm();
  form.uploadDir = path.join(process.cwd(), './uploads');
  form.keepExtensions = true;

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    if (!files.attachment) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = files.attachment.filepath;
    const fileResponse = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });

    fs.unlinkSync(filePath);

    return res.status(200).json({ message: 'File successfully uploaded.', file: fileResponse.data });
  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ message: 'Error processing upload.' }); 
  }
}