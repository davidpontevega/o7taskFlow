using Dapper;
using Oracle.ManagedDataAccess.Client;
using System.Data;
using Microsoft.Extensions.Configuration;
using System.Configuration;

namespace O7TaskFlow.Persistence.Context;

public class OracleDbContext
{
    private readonly string _connectionString;

    public OracleDbContext(IConfiguration config)
        => _connectionString = config.GetConnectionString("OracleConnection")!;

    public IDbConnection CreateConnection()
        => new OracleConnection(_connectionString);

    // Ejecuta un bloque PL/SQL anónimo y retorna un DataReader del cursor
    public async Task<OracleDataReader> ExecutePackageCursorAsync(
        string plsql,
        OracleParameter[] parameters)
    {
        var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();
        var cmd = new OracleCommand(plsql, conn)
        {
            CommandType = CommandType.Text,
            BindByName = true   // <- IMPORTANTE para Oracle con parámetros nombrados
        };
        cmd.Parameters.AddRange(parameters);
        // CloseConnection cierra la conexión cuando se cierra el reader
        return (OracleDataReader)await cmd.ExecuteReaderAsync(
            CommandBehavior.CloseConnection);
    }

    // Ejecuta DML sin cursor (INSERT, UPDATE, DELETE)
    public async Task<int> ExecuteAsync(string sql, object? param = null)
    {
        using var conn = CreateConnection();
        return await conn.ExecuteAsync(sql, param);
    }

    // Consulta con Dapper y mapeo automático
    public async Task<IEnumerable<T>> QueryAsync<T>(
        string sql, object? param = null)
    {
        using var conn = CreateConnection();
        return await conn.QueryAsync<T>(sql, param);
    }

    // Consulta un solo registro
    public async Task<T?> QueryFirstOrDefaultAsync<T>(
        string sql, object? param = null)
    {
        using var conn = CreateConnection();
        return await conn.QueryFirstOrDefaultAsync<T>(sql, param);
    }
    // Ejecuta PL/SQL que retorna un valor escalar (no cursor)
    public async Task ExecutePackageScalarAsync(
        string plsql,
        OracleParameter[] parameters)
    {
        await using var conn = new OracleConnection(_connectionString);
        await conn.OpenAsync();
        await using var cmd = new OracleCommand(plsql, conn)
        {
            CommandType = System.Data.CommandType.Text,
            BindByName = true
        };
        cmd.Parameters.AddRange(parameters);
        await cmd.ExecuteNonQueryAsync();
    }
}