import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { url } = req.body;
  const webhookUrl = 'https://discord.com/api/webhooks/1384312627651416209/LikhOku5IkGTtgT_QNyKzpob8xB5-9iRpQfJ4xfus1juUcFMNpV8PDG8vD1cfTGsRZoV';

  if (!url) {
    return res.status(400).json({ error: 'URL não fornecida' });
  }

  try {
    // Usando API do saveig.app para baixar o vídeo
    const response = await fetch('https://saveig.app/api/ajaxSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'referer': 'https://saveig.app/',
      },
      body: JSON.stringify({
        q: url,
        t: 'media',
        lang: 'en',
      }),
    });

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return res.status(400).json({ error: 'Vídeo não encontrado' });
    }

    const videoUrl = data.data[0].url;

    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      return res.status(500).json({ error: 'Erro ao baixar o vídeo' });
    }

    const videoBuffer = await videoResponse.buffer();

    const form = new FormData();
    form.append('file', videoBuffer, 'video.mp4');
    form.append('content', '🎥 Novo Reels enviado!');

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: form,
    });

    if (!discordResponse.ok) {
      return res.status(500).json({ error: 'Erro ao enviar para o Discord' });
    }

    return res.status(200).json({ message: 'Enviado com sucesso!' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno', details: error.message });
  }
}
