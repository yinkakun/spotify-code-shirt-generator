import fetch from 'isomorphic-unfetch';
import { parse, formatURI } from 'spotify-uri';
import type { NextApiRequest, NextApiResponse } from 'next';

const { getData } = require('spotify-url-info')(fetch);

const getSpotifyData = async (link: string) => {
  const parsedUri = parse(link);
  const uri = formatURI(parsedUri);
  const { name, type } = await getData(link);

  return { uri, name, type };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { link } = req.query as { link: string };

  if (!link) {
    res.status(400).json({ error: 'Missing spotify link' });
    return;
  }

  const { uri, name, type } = await getSpotifyData(link);

  res.status(200).json({ uri, name, type });
};

export default handler;
export { getSpotifyData };
