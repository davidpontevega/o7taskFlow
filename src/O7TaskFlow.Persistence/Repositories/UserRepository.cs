using O7TaskFlow.Domain.Interfaces.Repositories;
using O7TaskFlow.Persistence.Context;

namespace O7TaskFlow.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly OracleDbContext _db;
    public UserRepository(OracleDbContext db) => _db = db;

    public async Task<IEnumerable<UserInfo>> GetByCompanyAsync(
        string company, string branch)
    {
        const string sql = @"
        SELECT RTRIM(ctuccodusr) AS Code,
               RTRIM(ctucnomusr) AS FullName,
               RTRIM(ctuccorreo) AS Email,
               NVL(ctucurlfot,'') AS PhotoUrl
        FROM   ctdmusrcia
        WHERE  ctuccodcia = :company
        AND    ctuccodsuc = :branch
        ORDER  BY ctucnomusr";

        return await _db.QueryAsync<UserInfo>(sql, new { company, branch });
    }
}