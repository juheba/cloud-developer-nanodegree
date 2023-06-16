import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { TodoItem } from "../models/TodoItem";
import { TodosWithLastKey } from "../models/TodosWithLastKey";

import { createLogger} from '@utils'

const logger = createLogger('todoAccess')

const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

function createDynamoDBClient(): DocumentClient {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
      secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
    })
  }
  return new AWS.DynamoDB.DocumentClient();
}

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(limit: number, nextKey: AWS.DynamoDB.Key): Promise<TodosWithLastKey> {
    logger.info('Getting all todos')

    const scanParams = {
      TableName: this.todosTable,
      Limit: limit,
      ExclusiveStartKey: nextKey
    }
    const result = await this.docClient.scan(scanParams).promise()
    return {
      todos: result.Items as TodoItem[],
      lastKey: result.LastEvaluatedKey
    }
  }

  async getTodosForUser(userId: string, limit: number, nextKey: AWS.DynamoDB.Key): Promise<TodosWithLastKey> {
    logger.info({message: 'Getting todos by user', userId: userId})

    const queryParams = {
      TableName: this.todosTable,
      Limit: limit,
      ExclusiveStartKey: nextKey,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      /**
       * If ScanIndexForward is true, DynamoDB returns the results in the order in which they are stored (by sort key value). This is the default behavior.
       * If ScanIndexForward is false, DynamoDB reads the results in reverse order by sort key value, and then returns the results to the client.
       */
      //ScanIndexForward: false  // reverses the result order, meaning last inserted images comes first
    }

    const result = await this.docClient.query(queryParams).promise()
    return {
      todos: result.Items as TodoItem[],
      lastKey: result.LastEvaluatedKey
    }
  }

  async getTodosById(todoId: string): Promise<TodoItem> {
    logger.info({message: 'Getting a todo by id', todoId: todoId})

    const queryParams = {
      TableName: this.todosTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
        ':todoId': todoId
      },
      /**
       * If ScanIndexForward is true, DynamoDB returns the results in the order in which they are stored (by sort key value). This is the default behavior.
       * If ScanIndexForward is false, DynamoDB reads the results in reverse order by sort key value, and then returns the results to the client.
       */
      //ScanIndexForward: false  // reverses the result order, meaning last inserted images comes first
    }

    const result = await this.docClient.query(queryParams).promise()
    return result.Items[0] as TodoItem
  }

  async createTodo(todo: TodoItem) {
    logger.info({message: 'Creating a todo', todoId: todo.todoId})

    var params = {
      TableName : this.todosTable,
      Item: todo
    };
    await this.docClient.put(params).promise()
    return todo
  }

  async updateTodo(newTodo) {
    logger.info({message: 'Updating a todo', todoId: newTodo.todoId})

    var params = {
      TableName : this.todosTable,
      Key: newTodo.todoId,
      UpdateExpression: "SET name = :name",
      ExpressionAttributeValues: {
        ":name": {"S": newTodo.name},
        ":dueDate": {"S": newTodo.dueDate},
        ":done": {"S": newTodo.done},
      },
      ReturnValues: "ALL_NEW"
    };
    const result = await this.docClient.update(params).promise()
    return result.Attributes[0] as TodoItem
    //return updateTodo
  }

  async deleteTodo(todoId: string): Promise<Boolean> {
    logger.info({message: 'Delete todo', todoId: todoId})
    const params = {
      TableName: this.todosTable,
      Key: {
        id: todoId
      },
      ReturnValues: "ALL_NEW"
    }

    const result = await this.docClient.delete(params).promise()

    if (!result.Attributes) {
      return false
    }

    return true
  }

  /**
   * Validates if a todo exists.
   *
   * @param todoId  Id of a todo
   * @returns  true if todo exists
   * @throws Error if todo does not exist
   */
  async validateTodoExists(todoId: string): Promise<Boolean> {
    logger.info({message: 'Validate todo exists', todoId: todoId})
    const getParams = {
      TableName: this.todosTable,
      Key: {
        id: todoId
      }
    }

    const result = await this.docClient.get(getParams).promise()

    if (!result.Item) {
      return false
    }

    return true
  }
}