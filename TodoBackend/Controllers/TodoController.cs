using Microsoft.AspNetCore.Mvc;
using TodoBackend.Models;
using System.Linq;

namespace TodoBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {
        private static List<TodoItem> _todoItems = new List<TodoItem>();
        private static List<TodoItem> _deletedItems = new List<TodoItem>();
        private static int _nextId = 1;

        /// <summary>
        /// Get all active Todo items.
        /// </summary>
        /// <returns>List of active Todo items.</returns>
        [HttpGet]
        public ActionResult<IEnumerable<TodoItem>> GetAll()
        {
            return Ok(_todoItems);
        }

        /// <summary>
        /// Add a new Todo item.
        /// </summary>
        /// <param name="item">Todo item to add.</param>
        /// <returns>The created Todo item.</returns>
        [HttpPost]
        public ActionResult Add([FromBody] TodoItem item)
        {
            if (string.IsNullOrWhiteSpace(item.Title))
            {
                return BadRequest("Title is required.");
            }

            item.Id = _nextId++;
            item.CreatedAt = DateTime.UtcNow;
            _todoItems.Add(item);

            return CreatedAtAction(nameof(GetAll), new { id = item.Id }, item);
        }

        /// <summary>
        /// Delete a Todo item by ID.
        /// </summary>
        /// <param name="id">ID of the Todo item to delete.</param>
        /// <returns>No content or error if not found.</returns>
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var item = _todoItems.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                return NotFound($"Todo item with ID {id} not found.");
            }

            // Remove from active list and add to deleted list
            _todoItems.Remove(item);
            _deletedItems.Add(item);

            return NoContent();
        }

        /// <summary>
        /// Get all deleted Todo items.
        /// </summary>
        /// <returns>List of deleted Todo items.</returns>
        [HttpGet("deletedTodos")]
        public ActionResult<IEnumerable<TodoItem>> GetDeletedItems()
        {
            return Ok(_deletedItems);
        }

        /// <summary>
        /// Restore a deleted Todo item by ID.
        /// </summary>
        /// <param name="id">ID of the Todo item to restore.</param>
        /// <returns>No content or error if not found.</returns>
        [HttpPost("restore/{id}")]
        public ActionResult Restore(int id)
        {
            var item = _deletedItems.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                return NotFound($"Deleted Todo item with ID {id} not found.");
            }

            // Remove from deleted list and add back to active list
            _deletedItems.Remove(item);
            _todoItems.Add(item);

            return NoContent();
        }


        
    }
}
