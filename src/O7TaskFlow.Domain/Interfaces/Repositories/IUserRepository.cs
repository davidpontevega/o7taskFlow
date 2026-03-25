namespace O7TaskFlow.Domain.Interfaces.Repositories;

public interface IUserRepository
{
    Task<IEnumerable<UserInfo>> GetByCompanyAsync(string company, string branch);
}

public record UserInfo(
    string Code,
    string FullName,
    string? Email,
    string? PhotoUrl
);