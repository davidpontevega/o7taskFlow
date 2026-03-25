namespace O7TaskFlow.Domain.Entities;

public class Board
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navegación (no mapeado a BD directamente)
    public List<BoardColumn> Columns { get; set; } = new();
}