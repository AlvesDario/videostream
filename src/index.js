require('dotenv/config');

const fs = require('fs');
const express = require('express');
const app = express();

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    fs.readFile('./index.html', (err, html) => res.end(html));
});

app.get('/videos/:videoName', (req, res) => {
    const { videoName } = req.params;
    const videoFile = `../videos/${videoName}`;
    fs.stat(videoFile, (err, stats) => {
        if (err) {
            console.log(err);
            return res.status(404).end('<h1>Video Not found</h1>');
        }

        const { range } = req.headers;
        console.log(range.toString())
        const { size } = stats;
        const start = Number((range || '').replace(/bytes=/, '').split('-')[0]);
        const end = size - 1;
        const chunkSize = (end - start) + 1;

        res.set({
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        });

        res.status(206);

        const stream = fs.createReadStream(videoFile, { start, end });
        stream.on('open', () => stream.pipe(res));
        stream.on('error', (streamErr) => res.end(streamErr));
    });
});

app.listen(PORT, () => console.log(`Running on port ${PORT}!`));
