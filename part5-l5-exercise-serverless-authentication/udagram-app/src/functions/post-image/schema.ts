export default {
    type: 'object',
    title: 'ImageInputModel',
    description: 'Image to add to a image groups',
    properties: {
      title: {type: 'string'}
    },
    required: ['title'],
    additionalProperties: false
} as const;