using Oracle.ManagedDataAccess.Client;
using O7TaskFlow.Domain.Entities;
using O7TaskFlow.Domain.Interfaces.Services;
using O7TaskFlow.Persistence.Context;

namespace O7TaskFlow.Infrastructure.Security;

public class OracleSecurityService : ISecurityService
{
    private readonly OracleDbContext _db;

    public OracleSecurityService(OracleDbContext db) => _db = db;

    // ── LOGIN ────────────────────────────────────────────────────────────
    public async Task<UserSessionInfo?> LoginAsync(
        string user, string password,
        string company, string branch)
    {
        const string sql = @"
        BEGIN
          :cursor := WB01.security.Getuserandpassword(
            :user, :password, :company, :branch);
        END;";

        var parameters = new[]
        {
        new OracleParameter(":cursor", OracleDbType.RefCursor)
            { Direction = System.Data.ParameterDirection.Output },
        new OracleParameter(":user",     OracleDbType.Varchar2) { Value = user },
        new OracleParameter(":password", OracleDbType.Varchar2) { Value = password },
        new OracleParameter(":company",  OracleDbType.Char)     { Value = company },
        new OracleParameter(":branch",   OracleDbType.Char)     { Value = branch },
    };

        using var reader = await _db.ExecutePackageCursorAsync(sql, parameters);
        if (!await reader.ReadAsync())
        {
            return null;
        }

        return new UserSessionInfo
        {
            DbUser = SafeString(reader, 0),
            DbPassword = SafeString(reader, 1),
            FullName = SafeString(reader, 2),
            PhotoUrl = SafeString(reader, 3),
            UserCode = SafeString(reader, 4),
            Email = SafeString(reader, 6),
            Phone = SafeString(reader, 7),
            BranchName = SafeString(reader, 8),
            Company = company.Trim(),
            Branch = branch.Trim()
        };
    }

    // ── EMPRESAS ─────────────────────────────────────────────────────────
    public async Task<List<CompanyInfo>> GetCompaniesAsync(
        string user, string password)
    {
        const string sql = @"
            BEGIN
              :cursor := WB01.security.Companiesbd(:user, :pwd);
            END;";

        var parameters = new[]
        {
            new OracleParameter(":cursor", OracleDbType.RefCursor)
                { Direction = System.Data.ParameterDirection.Output },
            new OracleParameter(":user", OracleDbType.Varchar2) { Value = user },
            new OracleParameter(":pwd",  OracleDbType.Varchar2) { Value = password },
        };

        using var reader = await _db.ExecutePackageCursorAsync(sql, parameters);
        var result = new List<CompanyInfo>();
        while (await reader.ReadAsync())
            result.Add(new CompanyInfo(
                SafeString(reader, 0),
                SafeString(reader, 1)));
        return result;
    }

    // ── SUCURSALES ───────────────────────────────────────────────────────
    public async Task<List<BranchInfo>> GetBranchesAsync(
        string user, string password)
    {
        const string sql = @"
            BEGIN
              :cursor := WB01.security.Branchesbd(:user, :pwd);
            END;";

        var parameters = new[]
        {
            new OracleParameter(":cursor", OracleDbType.RefCursor)
                { Direction = System.Data.ParameterDirection.Output },
            new OracleParameter(":user", OracleDbType.Char) { Value = user },
            new OracleParameter(":pwd",  OracleDbType.Char) { Value = password },
        };

        using var reader = await _db.ExecutePackageCursorAsync(sql, parameters);
        var result = new List<BranchInfo>();
        while (await reader.ReadAsync())
            result.Add(new BranchInfo(
                SafeString(reader, 0),
                SafeString(reader, 1)));
        return result;
    }

    // ── VALIDAR PERMISOS ─────────────────────────────────────────────────
    public async Task<bool> CanAccessAsync(
        string company, string branch, string user,
        string module, string controller, string action)
    {
        const string sql = @"
            BEGIN
              :result := WB01.security.Canaccess(
                :company, :branch, :user,
                :module, :controller, :action);
            END;";

        var resultParam = new OracleParameter(":result", OracleDbType.Varchar2, 10)
        { Direction = System.Data.ParameterDirection.Output };

        var parameters = new[]
        {
            resultParam,
            new OracleParameter(":company",    OracleDbType.Varchar2) { Value = company },
            new OracleParameter(":branch",     OracleDbType.Varchar2) { Value = branch },
            new OracleParameter(":user",       OracleDbType.Varchar2) { Value = user },
            new OracleParameter(":module",     OracleDbType.Varchar2) { Value = module },
            new OracleParameter(":controller", OracleDbType.Varchar2) { Value = controller },
            new OracleParameter(":action",     OracleDbType.Varchar2) { Value = action },
        };

        await _db.ExecutePackageScalarAsync(sql, parameters);
        return resultParam.Value?.ToString()?.Trim() == "true";
    }

    // ── CAMBIAR CONTRASEÑA ───────────────────────────────────────────────
    public async Task<int> ChangePasswordAsync(
        string company, string branch, string user,
        string oldPassword, string newPassword)
    {
        const string sql = @"
            BEGIN
              :result := WB01.security.Changepassword(
                :company, :branch, :user,
                :oldpwd, :newpwd);
            END;";

        var resultParam = new OracleParameter(":result", OracleDbType.Int32)
        { Direction = System.Data.ParameterDirection.Output };

        var parameters = new[]
        {
            resultParam,
            new OracleParameter(":company", OracleDbType.Char)    { Value = company },
            new OracleParameter(":branch",  OracleDbType.Char)    { Value = branch },
            new OracleParameter(":user",    OracleDbType.Char)    { Value = user },
            new OracleParameter(":oldpwd",  OracleDbType.Char)    { Value = oldPassword },
            new OracleParameter(":newpwd",  OracleDbType.Char)    { Value = newPassword },
        };

        await _db.ExecutePackageScalarAsync(sql, parameters);
        return Convert.ToInt32(resultParam.Value);
    }

    // ── HELPER ───────────────────────────────────────────────────────────
    private static string SafeString(OracleDataReader r, int index)
        => r.IsDBNull(index) ? "" : r.GetString(index).Trim();
}