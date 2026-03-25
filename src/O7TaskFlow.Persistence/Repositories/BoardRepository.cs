using Dapper;
using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Repositories;
using O7TaskFlow.Persistence.Context;

namespace O7TaskFlow.Persistence.Repositories;

public class BoardRepository : IBoardRepository
{
    private readonly OracleDbContext _db;
    public BoardRepository(OracleDbContext db) => _db = db;

    public async Task<IEnumerable<Board>> GetByProjectAsync(int projectId)
    {
        const string sql = @"
            SELECT BRD_ID      AS Id,
                   BRD_PRJ_ID  AS ProjectId,
                   BRD_NAME    AS Name,
                   BRD_DESC    AS Description,
                   BRD_CREATED AS CreatedAt
            FROM   O7TF_BOARDS
            WHERE  BRD_PRJ_ID = :projectId
            ORDER  BY BRD_CREATED";

        return await _db.QueryAsync<Board>(sql, new { projectId });
    }

    public async Task<Board?> GetByIdWithColumnsAsync(int boardId)
    {
        const string sqlBoard = @"
        SELECT BRD_ID      AS Id,
               BRD_PRJ_ID  AS ProjectId,
               BRD_NAME    AS Name,
               BRD_DESC    AS Description,
               BRD_CREATED AS CreatedAt
        FROM   O7TF_BOARDS
        WHERE  BRD_ID = :boardId";

        const string sqlCols = @"
        SELECT COL_ID        AS Id,
               COL_BRD_ID    AS BoardId,
               COL_NAME      AS Name,
               COL_ORDER     AS SortOrder,
               COL_COLOR     AS Color,
               COL_WIP_LIMIT AS WipLimit
        FROM   O7TF_BOARD_COLUMNS
        WHERE  COL_BRD_ID = :boardId
        ORDER BY COL_ORDER";

        var board = await _db.QueryFirstOrDefaultAsync<Board>(
            sqlBoard, new { boardId });
        if (board is null) return null;

        var columns = await _db.QueryAsync<BoardColumn>(
            sqlCols, new { boardId });
        board.Columns = columns.ToList();
        return board;
    }

    public async Task<int> CreateAsync(Board board)
    {
        const string sql = @"
        INSERT INTO O7TF_BOARDS
            (BRD_PRJ_ID, BRD_NAME, BRD_DESC, BRD_CREATED)
        VALUES
            (:ProjectId, :Name, :Description, SYSDATE)
        RETURNING BRD_ID INTO :newId";

        using var conn = _db.CreateConnection();
        var param = new Dapper.DynamicParameters();
        param.Add("ProjectId", board.ProjectId);
        param.Add("Name", board.Name);
        param.Add("Description", board.Description);
        param.Add("newId",
            dbType: System.Data.DbType.Int32,
            direction: System.Data.ParameterDirection.Output);

        await conn.ExecuteAsync(sql, param);
        return param.Get<int>("newId");
    }

    public async Task<int> CreateColumnAsync(BoardColumn column)
    {
        const string sql = @"
        INSERT INTO O7TF_BOARD_COLUMNS
            (COL_BRD_ID, COL_NAME, COL_ORDER, COL_COLOR, COL_WIP_LIMIT)
        VALUES
            (:BoardId, :Name, :ColOrder, :Color, :WipLimit)
        RETURNING COL_ID INTO :newId";

        using var conn = _db.CreateConnection();
        var param = new Dapper.DynamicParameters();
        param.Add("BoardId", column.BoardId);
        param.Add("Name", column.Name);
        param.Add("ColOrder", column.Order);   // <-- renombrado
        param.Add("Color", column.Color);
        param.Add("WipLimit", column.WipLimit);
        param.Add("newId",
            dbType: System.Data.DbType.Int32,
            direction: System.Data.ParameterDirection.Output);

        await conn.ExecuteAsync(sql, param);
        return param.Get<int>("newId");
    }

    public async Task UpdateColumnAsync(BoardColumn column)
    {
        const string sql = @"
        UPDATE O7TF_BOARD_COLUMNS
        SET    COL_NAME      = :Name,
               COL_ORDER     = :ColOrder,
               COL_COLOR     = :Color,
               COL_WIP_LIMIT = :WipLimit
        WHERE  COL_ID = :Id";

        var param = new Dapper.DynamicParameters();
        param.Add("Name", column.Name);
        param.Add("ColOrder", column.Order);
        param.Add("Color", column.Color);
        param.Add("WipLimit", column.WipLimit);
        param.Add("Id", column.Id);

        await _db.ExecuteAsync(sql, param);
    }

    public async Task DeleteColumnAsync(int columnId)
    {
        const string sql = @"
            DELETE FROM O7TF_BOARD_COLUMNS
            WHERE COL_ID = :columnId";

        await _db.ExecuteAsync(sql, new { columnId });
    }
}