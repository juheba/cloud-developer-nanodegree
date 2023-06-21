export default {
    type: 'object',
    title: 'GroupInputModel',
    description: 'Image group to add to the groups',
    properties: {
      name: {type: 'string'},
      description: {type: 'string'}
    },
    required: ['name', 'description'],
    additionalProperties: false
} as const;