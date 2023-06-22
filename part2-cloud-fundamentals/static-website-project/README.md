Info: the project isn't deployed anymore

Links:
* `https://<api-id>.cloudfront.net`
* `https://<api-id>.cloudfront.net/index.html`
* `http://<static-website-bucket-name>.s3-website.<aws-region>.amazonaws.com`
* `http://<static-website-bucket-name>.s3-website.<aws-region>.amazonaws.com/index.html`

"Suggestions to Make Your Project Stand Out!"
1. Customize your website by changing some of the text. For example, change the name from “Travel Blog” to “<Your Name>’s Travel Blog”.
2. Change the background image of your website to display your favorite vacation photo instead of using the photo provided with the starter files.

Accourding to the suggestions i modified the uploaded files, reuploaded them and refreshed the CloudFront cache.
Steps i've done to fulfil the suggestions:
* Modified index.html:
  * Added my firstname to the blog title
  * Changed the background image to /img/bloggingtips-Travel-Blogger-Header.jpg (download origin: https://images.app.goo.gl/qQfF25ddyedv85KE9 )
* Actualized S3 bucket:
  * deleted original index.html
  * uploaded modified index.html
  * uploaded new background image in img
* Invalidated the CloudFront Cache:
  * to reload modified index.html
* View screenshots in folder suggestion