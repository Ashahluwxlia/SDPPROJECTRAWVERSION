#define 

using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Enable CORS to allow frontend requests
// Update the CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .WithExposedHeaders("*");
        });
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Task Management API",
        Version = "v1",
        Description = "API for managing tasks"
    });
});

// Register ApplicationDbContext with dependency injection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Enable CORS - single policy
app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Management API v1");
    });
    
    // Disable HTTPS redirection in development
    app.Use((context, next) =>
    {
        context.Request.Scheme = "http";
        return next();
    });
}
else 
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

// Authentication endpoints
app.MapPost("/auth/register", async (User user, ApplicationDbContext context) =>
{
    if (await context.Users.AnyAsync(u => u.Email == user.Email))
    {
        return Results.BadRequest("Email already registered");
    }

    context.Users.Add(user);
    await context.SaveChangesAsync();
    return Results.Created($"/users/{user.Id}", user);
});

app.MapPost("/auth/login", async (LoginRequest request, ApplicationDbContext context) =>
{
    var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
    if (user == null)
    {
        return Results.Unauthorized();
    }

    // For development only - in production use proper password hashing
    if (user.Password != request.Password)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new { 
        id = user.Id,
        email = user.Email,
        fullName = user.FullName,
        token = user.Id.ToString() // Temporary token for development
    });
});

// Task endpoints
app.MapPost("/tasks", async (Backend.Models.Task task, ApplicationDbContext context) =>
{
    context.Tasks.Add(task);
    await context.SaveChangesAsync();
    return Results.Created($"/tasks/{task.Id}", task);
});

app.MapDelete("/tasks/{id}", async (int id, ApplicationDbContext context) =>
{
    var task = await context.Tasks.FindAsync(id);
    if (task == null)
    {
        return Results.NotFound();
    }

    context.Tasks.Remove(task);
    await context.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/tasks", async (ApplicationDbContext context) =>
{
    var tasks = await context.Tasks.ToListAsync();
    return Results.Ok(tasks);
});

// Get single task by ID
app.MapGet("/tasks/{id}", async (int id, ApplicationDbContext context) =>
{
    var task = await context.Tasks.FindAsync(id);
    if (task == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(task);
});

// Update task
app.MapPut("/tasks/{id}", async (int id, Backend.Models.Task updatedTask, ApplicationDbContext context) =>
{
    var task = await context.Tasks.FindAsync(id);
    if (task == null)
    {
        return Results.NotFound();
    }

    task.Title = updatedTask.Title;
    task.Description = updatedTask.Description;
    task.DueDate = updatedTask.DueDate;
    task.Priority = updatedTask.Priority;
    task.Status = updatedTask.Status;
    task.Tags = updatedTask.Tags;
    task.IsRecurring = updatedTask.IsRecurring;
    task.RecurringPattern = updatedTask.RecurringPattern;
    task.AssignedTo = updatedTask.AssignedTo;
    task.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return Results.Ok(task);
});

app.MapControllers();
app.Run();

// Supporting types for authentication
public class LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}