import fetch from 'node-fetch';
import FormData from 'form-data';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const formData = new FormData();
  
  // Ovdje pretpostavljamo da imate string koji predstavlja sadržaj fajla
  // U stvarnoj aplikaciji, ovdje biste umjesto toga imali logiku za dobijanje Buffer-a fajla iz zahtjeva
  const fileContent = 'Ovdje unesite sadržaj vašeg fajla kao string.';
  const fileBuffer = Buffer.from(fileContent); // Pravilno kreiranje Buffer-a
  const fileName = 'yourfile.jsonl';
  
  formData.append('file', fileBuffer, fileName);
  formData.append('purpose', 'fine-tune');

  try {
    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Došlo je do greške na serveru.' });
  }
}
