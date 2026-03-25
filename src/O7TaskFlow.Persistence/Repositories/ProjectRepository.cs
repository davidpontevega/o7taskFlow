using Dapper;
using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Repositories;
using O7TaskFlow.Persistence.Context;

namespace O7TaskFlow.Persistence.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly OracleDbContext _db;
    public ProjectRepository(OracleDbContext db) => _db = db;

    public async Task<IEnumerable<Project>> GetAllAsync(
        string company, string branch)
    {
        const string sql = @"
            SELECT PRJ_ID          AS Id,
                   PRJ_CODCIA      AS CompanyCode,
                   PRJ_CODSUC      AS BranchCode,
                   PRJ_NAME        AS Name,
                   PRJ_DESC        AS Description,
                   PRJ_STATUS      AS Status,
                   PRJ_OWNER       AS Owner,
                   PRJ_COLOR       AS Color,
                   PRJ_CREATED     AS CreatedAt,
                   PRJ_UPDATED     AS UpdatedAt
            FROM   O7TF_PROJECTS
            WHERE  PRJ_CODCIA = :company
            AND    PRJ_CODSUC = :branch
            AND    PRJ_STATUS != 'DELETED'
            ORDER  BY PRJ_CREATED DESC";

        return await _db.QueryAsync<Project>(sql, new { company, branch });
    }

    public async Task<Project?> GetByIdAsync(int id)
    {
        const string sql = @"
            SELECT PRJ_ID      AS Id,
                   PRJ_CODCIA  AS CompanyCode,
                   PRJ_CODSUC  AS BranchCode,
                   PRJ_NAME    AS Name,
                   PRJ_DESC    AS Description,
                   PRJ_STATUS  AS Status,
                   PRJ_OWNER   AS Owner,
                   PRJ_COLOR   AS Color,
                   PRJ_CREATED AS CreatedAt,
                   PRJ_UPDATED AS UpdatedAt
            FROM   O7TF_PROJECTS
            WHERE  PRJ_ID = :id";

        return await _db.QueryFirstOrDefaultAsync<Project>(sql, new { id });
    }

    public async Task<int> CreateAsync(Project project)
    {
        const string sql = @"
        INSERT INTO O7TF_PROJECTS (
            PRJ_CODCIA, PRJ_CODSUC, PRJ_NAME,
            PRJ_DESC,   PRJ_STATUS, PRJ_OWNER,
            PRJ_COLOR,  PRJ_CREATED, PRJ_UPDATED)
        VALUES (
            :CompanyCode, :BranchCode, :Name,
            :Description, 'ACTIVE', :Owner,
            :Color, SYSDATE, SYSDATE)
        RETURNING PRJ_ID INTO :newId";

        using var conn = _db.CreateConnection();
        var param = new Dapper.DynamicParameters();
        param.Add("CompanyCode", project.CompanyCode);
        param.Add("BranchCode", project.BranchCode);
        param.Add("Name", project.Name);
        param.Add("Description", project.Description);
        param.Add("Owner", project.Owner);
        param.Add("Color", project.Color);
        param.Add("newId",
            dbType: System.Data.DbType.Int32,
            direction: System.Data.ParameterDirection.Output);

        await conn.ExecuteAsync(sql, param);
        return param.Get<int>("newId");
    }

    public async Task UpdateAsync(Project project)
    {
        const string sql = @"
            UPDATE O7TF_PROJECTS
            SET    PRJ_NAME    = :Name,
                   PRJ_DESC    = :Description,
                   PRJ_COLOR   = :Color,
                   PRJ_UPDATED = SYSDATE
            WHERE  PRJ_ID = :Id";

        await _db.ExecuteAsync(sql, project);
    }

    public async Task DeleteAsync(int id)
    {
        const string sql = @"
            UPDATE O7TF_PROJECTS
            SET    PRJ_STATUS  = 'DELETED',
                   PRJ_UPDATED = SYSDATE
            WHERE  PRJ_ID = :id";

        await _db.ExecuteAsync(sql, new { id });
    }
}