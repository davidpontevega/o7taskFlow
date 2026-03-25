using Dapper;
using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Repositories;
using O7TaskFlow.Persistence.Context;

namespace O7TaskFlow.Persistence.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly OracleDbContext _db;
    public TaskRepository(OracleDbContext db) => _db = db;

    public async Task<IEnumerable<TaskItem>> GetByBoardAsync(int boardId)
    {
        const string sql = @"
        SELECT t.TSK_ID        AS Id,
               t.TSK_COL_ID    AS ColumnId,
               t.TSK_BRD_ID    AS BoardId,
               t.TSK_TITLE     AS Title,
               t.TSK_DESC      AS Description,
               t.TSK_PRIORITY  AS Priority,
               t.TSK_STATUS    AS Status,
               t.TSK_ASSIGNED  AS AssignedTo,
               RTRIM(u.NOMUSR) AS AssignedName,
               t.TSK_REPORTER  AS Reporter,
               t.TSK_ORDER     AS SortOrder,
               t.TSK_DUE_DATE  AS DueDate,
               t.TSK_START     AS StartDate,
               t.TSK_CREATED   AS CreatedAt,
               t.TSK_UPDATED   AS UpdatedAt
        FROM   O7TF_TASKS t
        LEFT JOIN (
            SELECT RTRIM(CTUCCODUSR)       AS CODUSR,
                   MAX(RTRIM(CTUCNOMUSR))  AS NOMUSR
            FROM   CTDMUSRCIA
            GROUP  BY RTRIM(CTUCCODUSR)
        ) u ON u.CODUSR = RTRIM(t.TSK_ASSIGNED)
        WHERE  t.TSK_BRD_ID = :boardId
        ORDER  BY t.TSK_COL_ID, t.TSK_ORDER";

        return await _db.QueryAsync<TaskItem>(sql, new { boardId });
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT TSK_ID       AS Id,
                   TSK_COL_ID   AS ColumnId,
                   TSK_BRD_ID   AS BoardId,
                   TSK_TITLE    AS Title,
                   TSK_DESC     AS Description,
                   TSK_PRIORITY AS Priority,
                   TSK_STATUS   AS Status,
                   TSK_ASSIGNED AS AssignedTo,
                   TSK_REPORTER AS Reporter,
                   TSK_ORDER    AS SortOrder,
                   TSK_DUE_DATE AS DueDate,
                   TSK_START    AS StartDate,
                   TSK_CREATED  AS CreatedAt,
                   TSK_UPDATED  AS UpdatedAt
            FROM   O7TF_TASKS
            WHERE  TSK_ID = :id";

        return await _db.QueryFirstOrDefaultAsync<TaskItem>(sql, new { id });
    }

    public async Task<int> CreateAsync(TaskItem task)
    {
        const string sql = @"
        INSERT INTO O7TF_TASKS (
            TSK_COL_ID,   TSK_BRD_ID,  TSK_TITLE,
            TSK_DESC,     TSK_PRIORITY, TSK_STATUS,
            TSK_ASSIGNED, TSK_REPORTER, TSK_ORDER,
            TSK_DUE_DATE, TSK_START,   TSK_CREATED, TSK_UPDATED)
        VALUES (
            :p1, :p2, :p3,
            :p4, :p5, :p6,
            :p7, :p8, :p9,
            :p10, :p11, SYSDATE, SYSDATE)
        RETURNING TSK_ID INTO :p12";

        using var conn = _db.CreateConnection();
        var param = new Dapper.DynamicParameters();
        param.Add("p1", task.ColumnId);
        param.Add("p2", task.BoardId);
        param.Add("p3", task.Title);
        param.Add("p4", task.Description ?? "");
        param.Add("p5", task.Priority);
        param.Add("p6", task.Status);
        param.Add("p7", task.AssignedTo ?? "");
        param.Add("p8", task.Reporter);
        param.Add("p9", task.SortOrder);
        param.Add("p10", task.DueDate,
            dbType: System.Data.DbType.DateTime);
        param.Add("p11", task.StartDate,
            dbType: System.Data.DbType.DateTime);
        param.Add("p12",
            dbType: System.Data.DbType.Int32,
            direction: System.Data.ParameterDirection.Output);

        await conn.ExecuteAsync(sql, param);
        return param.Get<int>("p12");
    }

    public async Task UpdateAsync(TaskItem task)
    {
        const string sql = @"
        UPDATE O7TF_TASKS
        SET    TSK_TITLE    = :p1,
               TSK_DESC     = :p2,
               TSK_PRIORITY = :p3,
               TSK_STATUS   = :p4,
               TSK_ASSIGNED = :p5,
               TSK_DUE_DATE = :p6,
               TSK_START    = :p7,
               TSK_UPDATED  = SYSDATE
        WHERE  TSK_ID = :p8";

        using var conn = _db.CreateConnection();
        var param = new Dapper.DynamicParameters();
        param.Add("p1", task.Title);
        param.Add("p2", task.Description ?? "");
        param.Add("p3", task.Priority);
        param.Add("p4", task.Status);
        param.Add("p5", task.AssignedTo ?? "");
        param.Add("p6", task.DueDate,
            dbType: System.Data.DbType.DateTime);
        param.Add("p7", task.StartDate,
            dbType: System.Data.DbType.DateTime);
        param.Add("p8", task.Id);

        await conn.ExecuteAsync(sql, param);
    }

    public async Task MoveAsync(int taskId, int newColumnId, int newOrder)
    {
        const string sql = @"
            UPDATE O7TF_TASKS
            SET    TSK_COL_ID  = :newColumnId,
                   TSK_ORDER   = :newOrder,
                   TSK_UPDATED = SYSDATE
            WHERE  TSK_ID = :taskId";

        await _db.ExecuteAsync(sql, new { taskId, newColumnId, newOrder });
    }

    public async Task DeleteAsync(int id)
    {
        const string sql = "DELETE FROM O7TF_TASKS WHERE TSK_ID = :id";
        await _db.ExecuteAsync(sql, new { id });
    }

    public async Task<IEnumerable<TaskComment>> GetCommentsAsync(int taskId)
    {
        const string sql = @"
        SELECT c.CMT_ID      AS Id,
               c.CMT_TSK_ID  AS TaskId,
               c.CMT_USER    AS UserCode,
               RTRIM(u.NOMUSR) AS UserName,
               c.CMT_TEXT    AS Text,
               c.CMT_CREATED AS CreatedAt
        FROM   O7TF_TASK_COMMENTS c
        LEFT JOIN (
            SELECT DISTINCT RTRIM(CTUCCODUSR) AS CODUSR,
                            MAX(RTRIM(CTUCNOMUSR)) AS NOMUSR
            FROM CTDMUSRCIA
            GROUP BY RTRIM(CTUCCODUSR)
        ) u ON u.CODUSR = RTRIM(c.CMT_USER)
        WHERE  c.CMT_TSK_ID = :taskId
        ORDER  BY c.CMT_CREATED";

        return await _db.QueryAsync<TaskComment>(sql, new { taskId });
    }

    public async Task<int> AddCommentAsync(TaskComment comment)
    {
        const string sql = @"
            INSERT INTO O7TF_TASK_COMMENTS
                (CMT_TSK_ID, CMT_USER, CMT_TEXT, CMT_CREATED)
            VALUES
                (:TaskId, :UserCode, :Text, SYSDATE)
            RETURNING CMT_ID INTO :newId";

        using var conn = _db.CreateConnection();
        var param = new Dapper.DynamicParameters(comment);
        param.Add("newId",
            dbType: System.Data.DbType.Int32,
            direction: System.Data.ParameterDirection.Output);
        await conn.ExecuteAsync(sql, param);
        return param.Get<int>("newId");
    }
}