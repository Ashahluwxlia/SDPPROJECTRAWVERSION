namespace Backend.Models
{
    public class Task
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required DateTime DueDate { get; set; }
        public required string Priority { get; set; }  // low, medium, high
        public required string Status { get; set; }    // to-do, in-progress, completed
        public List<string> Tags { get; set; } = new();
        public bool IsRecurring { get; set; }
        public string? RecurringPattern { get; set; }  // daily, weekly, biweekly, monthly
        public required string CreatedBy { get; set; }
        public required string AssignedTo { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}