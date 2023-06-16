import { v4 as uuidv4 } from 'uuid';
import { TodoItem } from '../models/TodoItem'
import { TodosWithLastKey } from "../models/TodosWithLastKey";
import { TodoAccess } from '../dataLayer/todoAccess'
//import { AttatchmentsAccess } from '../dataLayer/attatchmentsAccess'
import { GetTodosRequest } from '../requests/GetTodosRequest'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()
//const attatchmentsAccess = new AttatchmentsAccess()

export async function getAllTodos(getTodosRequest: GetTodosRequest): Promise<TodosWithLastKey> {
  return await todoAccess.getAllTodos(getTodosRequest.limit, getTodosRequest.nextKey)
}

export async function getTodosForUser(userId: string, getTodosRequest: GetTodosRequest): Promise<TodosWithLastKey> {
  return await todoAccess.getTodosForUser(userId, getTodosRequest.limit, getTodosRequest.nextKey)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise <TodoItem> {
  const todoId = uuidv4()
  const todo = {
    userId: parseUserId(jwtToken),
    todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    //attachmentUrl: attatchmentsAccess.getAttatchmentUrl(todoId)
  }
  return await todoAccess.createTodo(todo)
}

export async function createAttachmentPresignedUrl(todoId: string) {
  //return await attatchmentsAccess.getUploadUrl(todoId)
  return undefined
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise <TodoItem> {
  const todo = {
    todoId: todoId,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  }
  return await todoAccess.updateTodo(todo)
}

export async function deleteTodo(todoId: string): Promise<Boolean> {
  return await todoAccess.deleteTodo(todoId)
}

/**
 * Validates if a todo exists.
 *
 * @param todoId  Id of a todo
 * @returns  true if todo exists
 * @throws Error if todo does not exist
 */
export async function validateTodoExists(todoId: string): Promise<Boolean> {
  return await todoAccess.validateTodoExists(todoId)
}