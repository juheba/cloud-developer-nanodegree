import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';
import { isNumeric } from 'validator';
import { config } from '../../../../config/config';

var http = require('http');

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//GET a specific resource by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
    let { id } = req.params;
    if (!id || !isNumeric(id)) {
        return res.status(400).send({ message: 'Required Id is not a number' });
    }
    const item = await FeedItem.findByPk(id);
    if(item.url) {
        item.url = AWS.getGetSignedUrl(item.url);
    }
    res.send(item);
});

router.get('/:id/filtered', 
    requireAuth,
    async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || !isNumeric(id)) {
        return res.status(400).send({ message: 'Required Id is not a number' });
    }
    const item = await FeedItem.findByPk(id);
    if(item.url) {
        item.url = AWS.getGetSignedUrl(item.url);
    }

    let host = config.apis.filter_server_url;
    let path = '/filteredimage';
    let query = '?image_url=' + item.url;
    const requestUrl = host + path + query;

    console.log(`requesting filter image_url: ${item.url}`);

    const options = {
        protocol: 'http:',
        method: 'GET',
        headers: {'Authorization': req.headers.authorization}
    };
      
    await http.get(new URL(requestUrl), options, (response: any) => {
        response.on('data', (d: Buffer) => {
            if (response.statusCode != 200) {
                return res.status(response.statusCode).send(d.toString());
            }
            var jsonObj = {
                dataurl: 'data:image/jpg;base64, ' + d.toString('base64')
            }
            return res.status(200).send(jsonObj);
        });
    }).on('error', (e: any) => {
        console.error(e);
        res.status(500).send('An error occured while requesting the filtered image.');
    });
});


// Update a specific resource by Primary Key
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;
    let { id } = req.params;
 
    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    if (!id || !isNumeric(id)) {
        return res.status(400).send({ message: 'Required Id is not a number' });
    }

    const item = await FeedItem.findByPk(id);
    if (!item) {
        return res.status(404).send({ message: `No feed with Id ${id} found` });
    }
    item.caption = caption;
    item.url = fileName;

    const saved_item = await item.save();
    saved_item.url = AWS.getGetSignedUrl(saved_item.url);

    res.send(item);
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;