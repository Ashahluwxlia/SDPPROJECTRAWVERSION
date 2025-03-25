// This is what your backend expects
public class User
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string FullName { get; set; }
    public string? Role { get; set; } = "user";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}