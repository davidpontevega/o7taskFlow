using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Repositories;

namespace O7TaskFlow.Application.Services;

public class BoardService : IBoardService
{
    private readonly IBoardRepository _repo;

    public BoardService(IBoardRepository repo) => _repo = repo;

    public async Task<IEnumerable<Board>> GetByProjectAsync(int projectId)
        => await _repo.GetByProjectAsync(projectId);

    public async Task<Board?> GetWithColumnsAsync(int boardId)
        => await _repo.GetByIdWithColumnsAsync(boardId);

    public async Task<int> CreateAsync(int projectId,
        string name, string? description)
    {
        var board = new Board
        {
            ProjectId = projectId,
            Name = name,
            Description = description
        };

        var boardId = await _repo.CreateAsync(board);

        // Crear columnas por defecto
        var defaultColumns = new[]
        {
            new BoardColumn { BoardId=boardId, Name="📋 Pendiente",   Order=0, Color="#6C63FF" },
            new BoardColumn { BoardId=boardId, Name="🔄 En Progreso", Order=1, Color="#F9C74F" },
            new BoardColumn { BoardId=boardId, Name="👁 En Revisión", Order=2, Color="#43D9AD" },
            new BoardColumn { BoardId=boardId, Name="✅ Completado",  Order=3, Color="#FF6584" },
        };

        foreach (var col in defaultColumns)
            await _repo.CreateColumnAsync(col);

        return boardId;
    }
}