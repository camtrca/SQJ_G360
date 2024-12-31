import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { trigger, style, animate, transition } from '@angular/animations';

// Interface defining the structure of a Todo item
interface Todo {
  id: number; // Unique identifier for the todo
  title: string; // Title or description of the todo
  isCompleted: boolean; // Completion status of the todo
  createdAt: Date; // Date the todo was created
}

@Component({
  selector: 'app-root', // Component's custom HTML tag
  templateUrl: './app.component.html', // Template file for this component
  styleUrls: ['./app.component.css'], // CSS file for styling this component
  standalone: true, // Declares this component as a standalone component
  imports: [
    CommonModule, // Provides common Angular directives like *ngIf and *ngFor
    FormsModule, // Enables two-way data binding with [(ngModel)]
    HttpClientModule, // Allows HTTP requests to interact with a backend API
  ],
  animations: [
    // Define fade-out animation for when an element is removed
    trigger('fadeOut', [
      transition(':leave', [
        style({ opacity: 1 }), // Start fully visible
        animate('0.5s ease', style({ opacity: 0 })), // Gradually fade to invisible
      ]),
    ]),
    // Define fade-in animation for when an element is added
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }), // Start invisible
        animate('0.5s ease', style({ opacity: 1 })), // Gradually fade to fully visible
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  // Properties for managing todos and app state
  todos: Todo[] = []; // List of current todos
  deletedTodos: Todo[] = []; // List of deleted todos
  newTodoTitle: string = ''; // Title of the new todo being added
  showInputBar: boolean = false; // Whether the input bar is displayed
  isHelpWindowOpen: boolean = false; // Whether the help window is open
  isDeletedWindowOpen: boolean = false; // Whether the deleted todos window is open
  reminderTime: number | null = null; // Reminder time in minutes for a new todo

  // Backend API endpoints
  private apiUrl = 'http://localhost:5062/api/todo'; // Endpoint for todos
  private deletedApiUrl = 'http://localhost:5062/api/Todo/deletedTodos'; // Endpoint for deleted todos

  // Inject HttpClient for making HTTP requests
  constructor(private http: HttpClient) {}

  // Lifecycle hook that runs when the component is initialized
  ngOnInit(): void {
    this.loadTodos(); // Load existing todos from backend
    this.loadDeletedTodos(); // Load deleted todos from backend
  }

  // Load todos from the backend API
  loadTodos(): void {
    this.http.get<Todo[]>(this.apiUrl).subscribe(
      (data) => {
        this.todos = data; // Update the local todos array
      },
      (error) => {
        console.error('Error loading todos:', error); // Log errors
      }
    );
  }

  // Load deleted todos from the backend API
  loadDeletedTodos(): void {
    this.http.get<Todo[]>(this.deletedApiUrl).subscribe(
      (data) => {
        this.deletedTodos = data; // Update the local deletedTodos array
      },
      (error) => {
        console.error('Error loading deleted todos:', error); // Log errors
      }
    );
  }

  // Add a new todo and send it to the backend
  addTodo(): void {
    if (!this.newTodoTitle.trim()) return; // Do nothing if the title is empty

    // Create a new todo object
    const newTodo: Partial<Todo> = {
      title: this.newTodoTitle,
      isCompleted: false,
      createdAt: new Date(),
    };

    // Send the new todo to the backend
    this.http.post<Todo>(this.apiUrl, newTodo).subscribe(
      (todo) => {
        this.todos.push(todo); // Add the new todo to the local list
        this.newTodoTitle = ''; // Clear the input field
        if (this.reminderTime) {
          // Set a reminder if specified
          setTimeout(() => {
            alert(`Reminder: ${todo.title}`);
          }, this.reminderTime * 60000);
          this.reminderTime = null; // Clear the reminder time
        }
      },
      (error) => {
        console.error('Error adding todo:', error); // Log errors
        alert('Failed to add the todo. Please check your backend.'); // Notify the user
      }
    );
  }

  // Delete a todo and move it to the deleted list
  deleteTodo(id: number): void {
    const deletedItem = this.todos.find((todo) => todo.id === id);
    if (!deletedItem) return; // Do nothing if the todo doesn't exist

    // Delete the todo from the backend
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(
      () => {
        // Remove the todo from the local list
        this.todos = this.todos.filter((todo) => todo.id !== id);

        // Add the deleted todo to the backend deleted list
        this.http.post<Todo>(this.deletedApiUrl, deletedItem).subscribe(
          () => {
            this.deletedTodos.push(deletedItem); // Add to the local deletedTodos list
          },
          (error) => {
            console.error('Error adding to deleted items:', error); // Log errors
          }
        );
      },
      (error) => {
        console.error('Error deleting todo:', error); // Log errors
      }
    );
  }

  // Restore a deleted todo to the main list
  restoreTodo(id: number): void {
    this.http.post(`http://localhost:5062/api/Todo/restore/${id}`, {}).subscribe(
      () => {
        const restoredItem = this.deletedTodos.find((todo) => todo.id === id);
        if (restoredItem) {
          this.deletedTodos = this.deletedTodos.filter((todo) => todo.id !== id); // Remove from deleted list
          this.todos.push(restoredItem); // Add back to the main list
        }
      },
      (error) => console.error('Error restoring todo:', error) // Log errors
    );
  }

  // Toggle the completion status of a todo
  toggleTodoCompletion(todo: Todo): void {
    todo.isCompleted = !todo.isCompleted; // Flip the completion status
    this.http.put(`${this.apiUrl}/${todo.id}`, todo).subscribe(
      () => console.log(`Todo ${todo.id} updated successfully.`), // Log success
      (error) => console.error('Error updating todo:', error) // Log errors
    );
  }

  // Navigate back to the title screen
  goToTitleScreen(): void {
    this.showInputBar = false; // Hide the input bar
  }

  // Open the help window
  openHelpWindow(): void {
    this.isHelpWindowOpen = true; // Set the help window to open
  }

  // Close the help window
  closeHelpWindow(): void {
    this.isHelpWindowOpen = false; // Set the help window to closed
  }

  // Open the deleted items window and refresh its content
  openDeletedWindow(): void {
    this.isDeletedWindowOpen = true; // Set the deleted window to open
    this.loadDeletedTodos(); // Refresh the deleted todos list
  }

  // Close the deleted items window
  closeDeletedWindow(): void {
    this.isDeletedWindowOpen = false; // Set the deleted window to closed
  }
}
