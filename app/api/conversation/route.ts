import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
        res.status(500).json({ message: 'Fehler beim Verarbeiten der Datei.' });
        return;
    }
    // Verarbeiten Sie hier Ihre Felder und Dateien...
    res.status(200).json({ message: 'Datei erfolgreich hochgeladen.' });
});
}