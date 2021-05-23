import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles, validURL } from './util/util';

(async () => {
	// Init the Express application
	const app = express();

	// Set the network port
	const port = process.env.PORT || 8082;

	// Use the body parser middleware for post requests
	app.use(bodyParser.json());

	// Root Endpoint
	// Displays a simple message to the user
	app.get('/', async (req, res) => {
		res.send('try GET /filteredimage?image_url={{}}');
	});

	app.get('/filteredimage', async (req, res) => {
		const url = req.query.image_url;

		if (!url) {
			return res.status(400).send({ message: 'Image url is required.' });
		}

		if (!validURL(url)) {
			return res.status(422).send({ message: 'The url is invalid.' });
		}

		try {
			let filteredPath: string = await filterImageFromURL(url);

			return res.status(200).sendFile(filteredPath, function (e) {
				if (!e) {
					deleteLocalFiles([filteredPath]);
				}
			});
		} catch (error) {
			return res.status(500).send({
				message: 'Something went wrong. Please, try again.',
			});
		}
	});

	// Start the Server
	app.listen(port, () => {
		console.log(`server running http://localhost:${port}`);
		console.log(`press CTRL+C to stop server`);
	});
})();
