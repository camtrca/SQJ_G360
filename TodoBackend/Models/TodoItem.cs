using System;
using System.ComponentModel.DataAnnotations;

namespace TodoBackend.Models
{
    public class TodoItem
    {
        /// <summary>
        /// Unique identifier for the Todo item.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Title or description of the Todo item.
        /// </summary>
        [Required(ErrorMessage = "Title is required.")]
        [MaxLength(255, ErrorMessage = "Title cannot exceed 255 characters.")]
        public string? Title { get; set; }

        /// <summary>
        /// Indicates whether the Todo item is completed.
        /// </summary>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// Timestamp indicating when the Todo item was created.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Reminder time in minutes (optional).
        /// </summary>
        [Range(1, 1440, ErrorMessage = "Reminder time must be between 1 and 1440 minutes (24 hours).")]
        public int? ReminderTimeInMinutes { get; set; }
    }
}
