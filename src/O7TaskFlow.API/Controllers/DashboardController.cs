using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using O7TaskFlow.Persistence.Context;

namespace O7TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly OracleDbContext _db;
    public DashboardController(OracleDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var company = User.FindFirst("company")?.Value!;
        var branch = User.FindFirst("branch")?.Value!;
        var user = User.FindFirst("user")?.Value!;

        const string sql = @"
            SELECT
              COUNT(t.TSK_ID)                                    AS TotalTasks,
              SUM(CASE WHEN t.TSK_STATUS='PENDING'     THEN 1 ELSE 0 END) AS Pending,
              SUM(CASE WHEN t.TSK_STATUS='IN_PROGRESS' THEN 1 ELSE 0 END) AS InProgress,
              SUM(CASE WHEN t.TSK_STATUS='IN_REVIEW'   THEN 1 ELSE 0 END) AS InReview,
              SUM(CASE WHEN t.TSK_STATUS='DONE'        THEN 1 ELSE 0 END) AS Done,
              SUM(CASE WHEN t.TSK_DUE_DATE < SYSDATE
                        AND t.TSK_STATUS != 'DONE'     THEN 1 ELSE 0 END) AS Overdue,
              SUM(CASE WHEN t.TSK_PRIORITY='HIGH'
                        OR  t.TSK_PRIORITY='CRITICAL'  THEN 1 ELSE 0 END) AS HighPriority
            FROM O7TF_TASKS t
            JOIN O7TF_BOARDS b     ON t.TSK_BRD_ID = b.BRD_ID
            JOIN O7TF_PROJECTS p   ON b.BRD_PRJ_ID = p.PRJ_ID
            WHERE p.PRJ_CODCIA = :company
            AND   p.PRJ_CODSUC = :branch
            AND   p.PRJ_STATUS != 'DELETED'";

        const string sqlByUser = @"
            SELECT
              RTRIM(t.TSK_ASSIGNED)           AS UserCode,
              RTRIM(u.CTUCNOMUSR)             AS FullName,
              COUNT(t.TSK_ID)                 AS Total,
              SUM(CASE WHEN t.TSK_STATUS='DONE' THEN 1 ELSE 0 END) AS Completed,
              SUM(CASE WHEN t.TSK_DUE_DATE < SYSDATE
                        AND t.TSK_STATUS != 'DONE' THEN 1 ELSE 0 END) AS Overdue
            FROM O7TF_TASKS t
            JOIN O7TF_BOARDS b   ON t.TSK_BRD_ID = b.BRD_ID
            JOIN O7TF_PROJECTS p ON b.BRD_PRJ_ID = p.PRJ_ID
            LEFT JOIN CTDMUSRCIA u
                   ON RTRIM(u.CTUCCODUSR) = RTRIM(t.TSK_ASSIGNED)
            WHERE p.PRJ_CODCIA = :company
            AND   p.PRJ_CODSUC = :branch
            AND   p.PRJ_STATUS != 'DELETED'
            AND   t.TSK_ASSIGNED IS NOT NULL
            AND   t.TSK_ASSIGNED != ' '
            GROUP BY RTRIM(t.TSK_ASSIGNED), RTRIM(u.CTUCNOMUSR)
            ORDER BY Total DESC";

        var stats = await _db.QueryFirstOrDefaultAsync<dynamic>(
            sql, new { company, branch });
        var byUser = await _db.QueryAsync<dynamic>(
            sqlByUser, new { company, branch });

        return Ok(new
        {
            totalTasks = (int)(stats?.TOTALTASKS ?? 0),
            pendingTasks = (int)(stats?.PENDING ?? 0),
            inProgressTasks = (int)(stats?.INPROGRESS ?? 0),
            inReviewTasks = (int)(stats?.INREVIEW ?? 0),
            completedTasks = (int)(stats?.DONE ?? 0),
            overdueTasks = (int)(stats?.OVERDUE ?? 0),
            highPriority = (int)(stats?.HIGHPRIORITY ?? 0),
            productivityByUser = byUser
        });
    }
}