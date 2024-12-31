import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Include necessary modules
})
export class TodoComponent implements OnInit {
  todos: any[] = []; // Array to store the list of TODO items
  newTodoTitle: string = ''; // Input field value for a new TODO
  private apiUrl = 'http://localhost:5062/api/todo'; // Backend API URL

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTodos(); // Load existing TODOs when the component initializes
  }

  // Fetch all TODOs from the backend
  loadTodos(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        this.todos = data; // Assign the fetched data to the todos array
      },
      (error) => {
        console.error('Error loading todos:', error); // Log errors if any
      }
    );
  }

  // Add a new TODO
  addTodo(): void {
    if (!this.newTodoTitle.trim()) {
      return; // Prevent adding empty or whitespace-only TODOs
    }

    const newTodo = { title: this.newTodoTitle, isCompleted: false }; // New TODO object
    this.http.post<any>(this.apiUrl, newTodo).subscribe(
      (todo) => {
        this.todos.push(todo); // Add the new TODO to the local list
        this.newTodoTitle = ''; // Clear the input field
      },
      (error) => {
        console.error('Error adding todo:', error); // Log errors if any
      }
    );
  }

  // Delete a TODO
  deleteTodo(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(
      () => {
        this.todos = this.todos.filter((todo) => todo.id !== id); // Remove the deleted TODO from the local list
      },
      (error) => {
        console.error('Error deleting todo:', error); // Log errors if any
      }
    );
  }
}
