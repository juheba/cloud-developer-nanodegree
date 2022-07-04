import { randomUUID } from 'crypto'
import { Image } from '../models/Image'
import { ImagesWithLastKey } from '../models/ImagesWithLastKey'
import { ImageAccess } from '../dataLayer/imageAccess'
import { GetImagesByGroupRequest } from '../requests/GetImagesByGroupRequest'
import { GetImageRequest } from '../requests/GetImageRequest'
import { CreateImageRequest } from '../requests/CreateImageRequest'

const imageAccess = new ImageAccess()

export async function getImagesByGroup(getImagesRequest: GetImagesByGroupRequest): Promise<ImagesWithLastKey> {
  return await imageAccess.getAllImagesByGroup(getImagesRequest.groupId, getImagesRequest.limit, getImagesRequest.nextKey)
}

export async function getImage(getImageRequest: GetImageRequest): Promise<Image> {
  return await imageAccess.getImage(getImageRequest.imageId)
}

export async function createImage(
  createImageRequest: CreateImageRequest
): Promise <Image> {
  const imageId = randomUUID()
  const image: Image = {
    imageId,
    groupId: createImageRequest.groupId,
    title: createImageRequest.title,
    timestamp: new Date().toISOString(),
    imageUrl: imageAccess.getImageUrl(imageId)
  }
  await imageAccess.createImage(image)
  return image
}

export async function getUploadUrl(imageId: string) {
  return await imageAccess.getUploadUrl(imageId)
}