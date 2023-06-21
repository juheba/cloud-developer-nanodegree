import { Image } from "./Image";

export interface ImagesWithLastKey {
  images: Image[],
  lastKey: AWS.DynamoDB.DocumentClient.Key
}